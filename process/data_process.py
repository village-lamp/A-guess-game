import xlrd2
import json

from util import get_cell_str


def process(input_file, output_file):
    labels = []
    data = []
    config = {}
    prop2label = {}
    book = xlrd2.open_workbook(input_file)
    title = ['label', 'prop', 'type', 'near']

    def read_labels():
        sheet = book.sheet_by_name('label')
        for row_index in range(1, sheet.nrows):
            label = {}
            for (idx, col_name) in enumerate(title):
                label[col_name] = get_cell_str(sheet, row_index, idx)

            if label['type'].find('groups') != -1:
                near = []
                idx = 3
                while idx < sheet.ncols and get_cell_str(sheet, row_index, idx) != "":
                    temp = get_cell_str(sheet, row_index, idx)
                    temp = temp.split(',')
                    if len(temp) == 1:
                        near.append(temp[0])
                    else:
                        near.append(temp)
                    idx += 1
                label['near'] = near
            labels.append(label)

    def read_data():
        nonlocal prop2label
        sheet = book.sheet_by_name('data')

        headers = sheet.row_values(0)
        prop2label = sheet.row_values(1)
        prop2label = {prop: name for (prop, name) in zip(headers, prop2label)}
        headers = {header: idx for idx, header in enumerate(headers)}

        for row_index in range(2, sheet.nrows):
            data_ = {}
            if config['hasPic'] == 'true':
                labels_ = [{"prop": "pic_url", "type": ""}]
            else:
                labels_ = []
            labels_.extend(labels)
            for label in labels_:
                idx = headers[label['prop']]
                if label['type'].find('list') != -1:
                    value = get_cell_str(sheet, row_index, idx)
                    if value == '':
                        data_[label['prop']] = []
                    else:
                        value = value.split(',')
                        data_[label['prop']] = value
                else:
                    data_[label['prop']] = get_cell_str(sheet, row_index, idx)
            data.append(data_)

    def read_config():
        sheet = book.sheet_by_name('config')
        config['maxStep'] = 10
        config['hasPic'] = "true"
        headers = sheet.row_values(0)
        for idx, header in enumerate(headers):
            config[header] = get_cell_str(sheet, 1, idx)

    def write_to_file():
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('export const columns = ' + json.dumps(labels, ensure_ascii=False, indent=4) + ';\n')
            f.write('export const mainData = ' + json.dumps(data, ensure_ascii=False) + ';\n')
            f.write('export const prop2label = ' + json.dumps(prop2label, ensure_ascii=False) + ';\n')

            for config_ in config:
                value = config[config_]
                f.write(f'export const {config_} = {value};\n')

    read_config()
    read_labels()
    read_data()
    write_to_file()


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file', type=str, help='the input file of label and data')
    parser.add_argument('--output_file', default='./data.js', type=str, help='the output file')

    process(parser.parse_args().input_file, parser.parse_args().output_file)


if __name__ == "__main__":
    main()
