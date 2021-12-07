import math
import sys
import time
import logging


class Item:
    asin: str
    title: str
    group: str
    salesrank: int
    similar: list[str]
    num_ratings: int
    avg_rating: float


metadata: dict = {}
graph: list[list[str]]


def parse_metadata(metadata_path='./data/amazon-meta.txt'):
    logging.info(f'Opening {metadata_path}')
    with open(metadata_path, 'r') as f:
        lines = f.readlines()
    logging.info(f'Read {metadata_path}')

    curr_id = None
    discontinued_items: int = 0
    not_discontinued_items: int = 0
    num_items: int = 0
    i: int = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('Id:'):
            num_items += 1
            if lines[i + 2].strip().startswith('discontinued'):
                # logging.info(f'Skipped discontinued item. {line}')
                discontinued_items += 1
                i += 4  # Move to next item
                continue

            curr_id = line.strip().split()[1]
            metadata[curr_id] = Item()
            i += 1
            continue
        elif line.startswith('ASIN:'):
            not_discontinued_items += 1

            metadata[curr_id].asin = lines[i].split()[1]
            metadata[curr_id].title = lines[i + 1].split(' ', 1)[1]
            metadata[curr_id].group = lines[i + 2].split(' ', 1)[1]
            metadata[curr_id].salesrank = int(lines[i + 3].split()[1])
            metadata[curr_id].similar = lines[i + 4].strip().split()[2:]

            # Advance i to reviews section
            i += 6 + int(lines[i + 5].strip().split()[1])

            # reviews: total: 12  downloaded: 12  avg rating: 4.5
            reviews_line = lines[i].strip().split()
            metadata[curr_id].num_ratings = reviews_line[2]
            metadata[curr_id].avg_rating = reviews_line[7]

            # Advance i to next item's ID
            i += 2 + int(reviews_line[4])
            continue

        i += 1

    logging.info(f'Total items: {num_items}\nDiscontinued items: {discontinued_items}')


def parse_graph(graph_path='./data/amazon0601.txt'):
    logging.info(f'Opening {graph_path}')
    with open(graph_path, 'r') as f:
        data = f.readlines()
    logging.info(f'Read {graph_path}')

    highest: int = int(data[-1].strip().split()[0])
    graph = [[] for _ in range(highest+1)]
    i = 0
    for line in data[4:]:
        frm, to = [x for x in line.strip().split()]
        if metadata and (frm not in metadata or to not in metadata):
            continue
        i += 1
        graph[int(frm)].append(to)

    logging.info(f'Parsed {i} edges')



if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.info('Started program')
    parse_metadata()
    parse_graph()
