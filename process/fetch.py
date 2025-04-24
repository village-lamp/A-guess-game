import os
import re

import xlrd
import xlwt
import time

import requests

from bs4 import BeautifulSoup

from util import get_seh_attribute, get_seh_gender, get_seh_total_ability


def fetch_or_read(url, fetch_path):
    if os.path.exists(fetch_path):
        print("reading " + fetch_path)
        with open(fetch_path, "r", encoding='utf-8') as f:
            html = f.read()
    # else:
    #     print("fetching " + fetch_path)
    #     requests.packages.urllib3.disable_warnings()
    #     response = requests.get(url)
    #     response.encoding = response.apparent_encoding
    #     html = response.text
    #     if response.status_code == 200:
    #         with open(fetch_path, "w", encoding='utf-8') as f:
    #             f.write(html)
    #     else:
    #         print("fail")
    #     time.sleep(10)
    return html


def fetch_or_read_main():
    url = "http://www.4399.com/flash/seer.htm"
    html = fetch_or_read(url, fetch_path="./htmls/main_page.html")
    return html


def fetch_or_read_sprite(url):
    number = url.removesuffix('.htm').split('/')[-1]
    url = "http:" + url
    html = fetch_or_read(url, fetch_path=f"./htmls/sprite_{number}.html")
    return html


def get_sprite_url_list():
    url_list = []
    html = fetch_or_read_main()
    soup = BeautifulSoup(html, "lxml")
    soup = soup.find('div', class_="ul2 cf").ul
    sprite_list = soup.find_all('li')
    for sprite in sprite_list:
        url_list.append(sprite.a.get('href'))
    return url_list


def print2xlsx(sprites, output_file):
    book = xlwt.Workbook()
    sh = book.add_sheet('data')

    titles = ["value", "id", "total_ability", "attribute", "gender", "grade", "sprite_type", "evo_method", "region",
              "pic_url"]
    titles_zh = ["名称", "精灵编号", "种族值", "属性", "性别", "等级", "精灵类型", "进化方法", "区域", ""]
    titles = {value: idx for idx, value in enumerate(titles)}
    titles_zh = {value: idx for idx, value in enumerate(titles_zh)}

    for title in titles:
        sh.write(0, titles[title], title)
    for title in titles_zh:
        sh.write(1, titles_zh[title], title)

    sprites = sorted(sprites, key=lambda x: x["id"])
    for (idx, sprite) in enumerate(sprites):
        for key in sprite:
            value = sprite[key]
            if key in titles:
                sh.write(idx + 2, titles[key], value)

    book.save(output_file)


def fetch(output_file):
    sprite_url_list = get_sprite_url_list()
    sprites = []

    for url in sprite_url_list:
        try:
            sprite = {}
            html = fetch_or_read_sprite(url)
            soup = BeautifulSoup(html, "lxml")
            sprite['pic_url'] = "https:" + soup.find('li', class_='cur').a.img.get('src')
            item1 = soup.find('div', class_='item1').dl
            sprite['value'] = item1.dt.text
            item1 = item1.dd.find_all('span')
            sprite['id'] = re.match("精灵序号：(.*)", item1[0].text).groups()[0]
            sprite['gender'] = get_seh_gender(re.match("精灵性别：(.*)", item1[1].text).groups()[0])
            sprite['grade'] = re.match("精灵等级：(.*)", item1[2].text).groups()[0]
            sprite['sprite_type'] = re.match("精灵类型：(.*)", item1[3].text).groups()[0]
            attribute = soup.find('div', class_='item2').dl.dt.i.text
            sprite['attribute'] = get_seh_attribute(attribute)
            sprites.append(sprite)
            race = soup.find('div', class_='race').table.tbody.tr.find_all('td')
            sprite['total_ability'] = get_seh_total_ability(race[-1].text)
        except Exception as e:
            pass

    print2xlsx(sprites, output_file)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_file", type=str, default="./output.xls", help="output file")

    fetch(parser.parse_args().output_file)


if __name__ == "__main__":
    main()
