import math
import sys
import time
import logging
import json
from typing import List, Dict


class Item:
    """An Amazon item. Contains an item's properties like title and avg. rating, and a list of nodes it links to."""

    id: str
    asin: str
    title: str
    group: str
    salesrank: int
    num_ratings: int
    avg_rating: float
    similar_items: List[str]
    recommendations_from_here: List[str] = None


class Parser:
    """
    Parses and holds parsed data from amazon-meta.txt and amazon0601.txt, and allows dumping to JSON.

    Creates and holds metadata and graph dictionaries:
    Metadata links an item ID to an Item object, which contains attributes and a list of the nodes it connects to.
    Graph links an item ID to just a list of the nodes it connects to. Graph is a subset of metadata. """

    metadata: Dict[str, Item] = None
    graph: Dict[str, List[str]] = None

    INCLUDE_GRAPH_IN_METADATA: bool = True

    def __init__(self, include_graph_in_metadata=True):
        self.INCLUDE_GRAPH_IN_METADATA = include_graph_in_metadata

    def parse_metadata(self, metadata_path='./data/amazon-meta.txt') -> None:
        self.metadata = {}

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
                self.metadata[curr_id] = Item()
                i += 1
                continue
            elif line.startswith('ASIN:'):
                not_discontinued_items += 1

                self.metadata[curr_id].id = curr_id
                self.metadata[curr_id].asin = lines[i].strip().split()[1]
                self.metadata[curr_id].title = lines[i + 1].strip().split(' ', 1)[1]
                self.metadata[curr_id].group = lines[i + 2].strip().split(' ', 1)[1]
                self.metadata[curr_id].salesrank = int(lines[i + 3].strip().split()[1])
                # self.metadata[curr_id].similar_items = lines[i + 4].strip().split()[2:]
                if self.INCLUDE_GRAPH_IN_METADATA:
                    self.metadata[curr_id].recommendations_from_here = []

                # Advance i to reviews section
                i += 6 + int(lines[i + 5].strip().split()[1])

                # reviews: total: 12  downloaded: 12  avg rating: 4.5
                reviews_line = lines[i].strip().split()
                self.metadata[curr_id].num_ratings = reviews_line[2]
                self.metadata[curr_id].avg_rating = reviews_line[7]

                # Advance i to next item's ID
                i += 2 + int(reviews_line[4])
                continue

            i += 1

        logging.info(f'Total items: {num_items}\nDiscontinued items: {discontinued_items}')

    def parse_graph(self, graph_path='./data/amazon0601.txt') -> None:
        logging.info(f'Opening {graph_path}')
        with open(graph_path, 'r') as f:
            data = f.readlines()
        logging.info(f'Read {graph_path}')

        self.graph = {}
        i = d = 0
        for line in data[4:]:
            frm, to = [x for x in line.strip().split()]
            if self.metadata and (frm not in self.metadata or to not in self.metadata):
                d += 1
                continue

            if self.INCLUDE_GRAPH_IN_METADATA:
                if self.metadata[frm].recommendations_from_here:
                    self.metadata[frm].recommendations_from_here.append(to)
                else:
                    self.metadata[frm].recommendations_from_here = [to]

            if frm not in self.graph:
                self.graph[frm] = [to]
            else:
                self.graph[frm].append(to)

            i += 1

        logging.info(f'Read {i} edges, skipped {d} of them (one or both nodes were discontinued)')

    def dump_metadata_json(self):
        reformed_metadata = {key: vars(val) for (key, val) in self.metadata.items()}
        with open("./data/metadata.json", "w") as f:
            json.dump(reformed_metadata, f, indent=4)

    def dump_graph_json(self):
        with open("./data/graph.json", "w") as f:
            json.dump(self.graph, f, indent=4)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.info('Started program')

    p = Parser()

    p.parse_metadata()
    p.parse_graph()

    p.dump_metadata_json()
    p.dump_graph_json()

    print(f"Metadata for item with ID 100: {vars(p.metadata['100'])}")
    print(f"Edges from item with ID 100: {p.graph['100']}")

    logging.info('Done')
