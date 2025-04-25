import xlrd2
import xlwt


from bs4 import BeautifulSoup

from fetch_util import fetch_or_read
from util import get_cell_str


headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Referer': 'https://wiki.biligame.com/'
}


def fetch_or_read_block(block_name):
    url = "https://wiki.biligame.com/mc/" + block_name
    html = fetch_or_read(url, f"./htmls/{block_name}.html", 1, headers, fetch=False)
    return html


def get_block_list():
    book = xlrd2.open_workbook("./minecraft-nature-block-list.xlsx")
    sheet = book.sheets()[0]
    block_list = []
    for i in range(sheet.nrows):
        block_list.append(get_cell_str(sheet, i, 0))
    return block_list


tool_url = {
    "/mc/%E9%94%B9": "锹",
    "/mc/%E9%95%90": "镐",
    "/mc/%E9%94%84": "锄",
    "/mc/%E5%89%AA%E5%88%80": "剪刀",
    "/mc/%E5%89%91": "剑",
    "/mc/%E6%96%A7": "斧"
}


def get_mc_tool(field):
    field = field.find_all('a')
    if len(field) == 0:
        return "无"
    tools = []
    for tool in field:
        tools.append(tool_url[tool.get('href')])
    return ",".join(tools)


def print2xlsx(sprites, output_file):
    book = xlwt.Workbook()
    sh = book.add_sheet('data')

    titles = ["value", "tool", "generate", "get_method", "usage", "pic_url"]
    titles_zh = ["名称", "挖掘工具", "自然生成", "获取途径", "用途", ""]
    titles = {value: idx for idx, value in enumerate(titles)}
    titles_zh = {value: idx for idx, value in enumerate(titles_zh)}

    for title in titles:
        sh.write(0, titles[title], title)
    for title in titles_zh:
        sh.write(1, titles_zh[title], title)

    for (idx, sprite) in enumerate(sprites):
        for key in sprite:
            value = sprite[key]
            if key in titles:
                sh.write(idx + 2, titles[key], value)

    book.save(output_file)


def fetch(output_file):
    block_list = get_block_list()
    blocks = []

    for block in block_list:
        block_info = {'value': block}
        try:
            html = fetch_or_read_block(block)
            soup = BeautifulSoup(html, 'lxml')
            # 获取图片
            block_info['pic_url'] = soup.find('div', class_='infobox-invimages').find('img')['src']
            # 获取挖掘工具
            info_rows = (soup.find('div', class_='notaninfobox')
                         .find('div', class_='infobox-rows')
                         .find_all('div', class_='infobox-row'))
            info_rows = {row.find_next('div').text.replace('\n', ''): row for row in info_rows}
            block_info['tool'] = get_mc_tool(info_rows['合适挖掘工具'].find('div', class_='infobox-row-field'))
            # 获取自然生成
            generate = []
            span = soup.find('span', id="自然生成").parent
            while span.find_next_sibling().name == 'p':
                span = span.find_next_sibling()
                text = span.text
                idx = span.text.find("自然生成")
                if idx != -1:
                    generate.append(text[idx + len("自然生成"):])
            block_info['generate'] = ",".join(generate)
            # 获取获取方式以及用途
            toctitle = soup.find('div', class_='toctitle').find_next_sibling().find_all("li")
            for title in toctitle:
                if title.find("a").get('href') == "#获取":
                    get_method = [m.a.get('href').removeprefix('#')
                                  for m in title.find('ul').find_all('li')]
                    block_info['get_method'] = ",".join(get_method)
                if title.find("a").get('href') == "#用途":
                    usage = [m.a.get('href').removeprefix('#')
                             for m in title.find('ul').find_all('li')]
                    block_info['usage'] = ",".join(usage)

        except Exception:
            pass
        blocks.append(block_info)

    print2xlsx(blocks, output_file)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_file", type=str, default="./output.xls", help="output file")

    fetch(parser.parse_args().output_file)


if __name__ == "__main__":
    main()
