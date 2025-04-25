import os
import time

import requests


def fetch_or_read(url, fetch_path, sleep_time, headers, fetch=True, verbose=False):
    html = None
    if os.path.exists(fetch_path):
        if verbose:
            print("reading " + fetch_path)
        with open(fetch_path, "r", encoding='utf-8') as f:
            html = f.read()
    else:
        if fetch:
            if verbose:
                print("fetching " + fetch_path)
            requests.packages.urllib3.disable_warnings()
            response = requests.get(url, headers=headers)
            response.encoding = response.apparent_encoding
            html = response.text
            if response.status_code == 200:
                with open(fetch_path, "w", encoding='utf-8') as f:
                    f.write(html)
            else:
                if verbose:
                    print("fail")
            time.sleep(sleep_time)
    return html
