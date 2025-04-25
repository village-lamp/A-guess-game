import xlwt


def main():
    book = xlwt.Workbook()

    sheet = book.add_sheet('data')
    sheet.write(0, 0, 'value')
    for i in range(1000):
        sheet.write(i + 2, 0, i + 1)

    book.save('./number.xls')


if __name__ == '__main__':
    main()
