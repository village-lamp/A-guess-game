import xlrd2
import json

from util import get_cell_str


def process(input_file, output_file):
    labels = []
    data = []
    prop2label = {}
    book = xlrd2.open_workbook(input_file)
    title = ['label', 'prop', 'type', 'near']

    def read_labels():
        sheet = book.sheet_by_name('label')
        for row_index in range(1, sheet.nrows):
            label = {}
            for (idx, col_name) in enumerate(title):
                label[col_name] = get_cell_str(sheet, row_index, idx)
            labels.append(label)

    def read_data():
        nonlocal prop2label
        sheet = book.sheet_by_name('data')

        headers = sheet.row_values(0)
        prop2label = sheet.row_values(1)
        prop2label = {prop: name for (prop, name) in zip(headers, prop2label)}
        headers = {header: idx for idx, header in enumerate(headers)}

        for row_index in range(1, sheet.nrows):
            data_ = {}
            for label in labels:
                idx = headers[label['prop']]
                if label['type'] == 'normal_list':
                    value = get_cell_str(sheet, row_index, idx)
                    value = value.split(',')
                    data_[label['prop']] = value
                else:
                    data_[label['prop']] = get_cell_str(sheet, row_index, idx)
            data.append(data_)

    def write_to_file():
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('export const columns = ' + json.dumps(labels, ensure_ascii=False, indent=4) + ';\n')
            f.write('export const mainData = ' + json.dumps(data, ensure_ascii=False) + ';\n')
            f.write('export const prop2label = ' + json.dumps(prop2label, ensure_ascii=False) + ';\n')
            f.write('export const maxStep = 1;')

    read_labels()
    read_data()
    write_to_file()


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file', type=str, help='the input file of label and data')
    parser.add_argument('output_file', default='./data.js', type=str, help='the output file')

    process(parser.parse_args().input_file, parser.parse_args().output_file)


if __name__ == "__main__":
    main()
