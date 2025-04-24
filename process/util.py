import xlrd2


seh_attributes = ["火", "水", "草",
                  "飞行", "电", "地面",
                  "机械", "冰", "超能",
                  "普通", "战斗", "暗影",
                  "光", "龙", "神秘",
                  "圣灵", "次元", "远古",
                  "邪灵", "自然", "王",
                  "混沌", "神灵", "轮回",
                  "虫", "虚空"]


def get_seh_attribute(attribute):
    attributes = []
    for seh_attribute in seh_attributes:
        if attribute.startswith(seh_attribute):
            attributes.append(seh_attribute)
            attribute = attribute[len(seh_attribute):]
    return ",".join(attributes)


def get_seh_gender(gender):
    if gender == "雌":
        return "雌性"
    if gender == "雄":
        return "雄性"
    if gender == "无":
        return "无性别"
    return gender


def get_seh_total_ability(total_ability):
    try:
        total_ability = int(total_ability)
    except ValueError:
        return "0"
    return str(total_ability)


def get_cell_str(sheet, rowx, colx):
    value = sheet.cell(rowx=rowx, colx=colx).value
    if isinstance(value, float):
        value = str(int(value))
    return value
