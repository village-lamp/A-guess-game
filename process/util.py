import xlrd2


def get_cell_str(sheet, rowx, colx):
    value = sheet.cell(rowx=rowx, colx=colx).value
    if isinstance(value, float):
        value = str(int(value))
    return value
