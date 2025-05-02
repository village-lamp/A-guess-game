import os

import xlrd2
import json

from util import get_cell_str


def process(input_path, name, output_file):
    labels = []
    data = []
    config = {}
    prop2label = {}
    metadata = {'title': '', 'pic_url': '', 'description': '', 'prop': ''}
    data_processor = 'export class MyDataProcessor extends DataProcessor {}'
    rule = ''

    xlsx_path = os.path.join(input_path, f'{name}.xlsx')
    js_path = os.path.join(input_path, f'data_processor.js')
    md_path = os.path.join(input_path, f'rule.md')

    book = xlrd2.open_workbook(xlsx_path)
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

            if label['type'] == 'num_order':
                label['pattern'] = get_cell_str(sheet, row_index, 4)
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

    def read_metadata():
        sheet = book.sheet_by_name('metadata')
        headers = sheet.row_values(0)
        headers = {h: idx for (idx, h) in enumerate(headers)}
        for key in metadata.keys():
            metadata[key] = get_cell_str(sheet, 1, headers[key])

    def read_rule():
        nonlocal rule
        if os.path.exists(md_path):
            with open(md_path, 'r', encoding='utf-8') as f:
                rule = f.read()

    def read_data_processor():
        nonlocal data_processor
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                data_processor = f.read()

    def write_to_file():
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('export const columns = ' + json.dumps(labels, ensure_ascii=False, indent=4) + ';\n')
            f.write('export const mainData = ' + json.dumps(data, ensure_ascii=False) + ';\n')
            f.write('export const prop2label = ' + json.dumps(prop2label, ensure_ascii=False) + ';\n')

            for config_ in config:
                value = config[config_]
                f.write(f'export const {config_} = {value};\n')

            f.write(f'export const rule = {repr(rule)};\n')

            f.write('import DataProcessor from "../script/dataProcessor.js";\n')
            f.write(data_processor + '\n')

    read_metadata()
    read_config()
    read_labels()
    read_data()
    read_rule()
    read_data_processor()
    write_to_file()
    print(metadata)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('input_path', type=str, help='the input path of dataset')
    parser.add_argument('name', type=str, help='name of the dataset')
    parser.add_argument('--output_file', default='./data.js', type=str, help='the output file')

    process(parser.parse_args().input_path, parser.parse_args().name, parser.parse_args().output_file)


if __name__ == "__main__":
    main()
