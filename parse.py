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
    """Parses and holds parsed data from amazon-meta.txt and amazon0601.txt, and allows dumping to JSON.

    Creates and holds metadata and graph dictionaries:
    Metadata links an item ID to an Item object, which contains attributes and a list of the nodes it connects to.
    Graph links an item ID to just a list of the nodes it connects to. Graph is a subset of metadata.
    """

    metadata: Dict[str, Item] = None

    graph_adj: Dict[str, List[str]] = None
    graph_edgelist: List[List[str]] = None

    INCLUDE_GRAPH_IN_METADATA: bool

    def __init__(self, include_graph_in_metadata=True):
        """Includes one option for whether adjacencies should be stored in metadata (True), or just in the graph."""

        self.INCLUDE_GRAPH_IN_METADATA = include_graph_in_metadata

    def parse_metadata(self, metadata_path='./data/amazon-meta.txt') -> None:
        """Parses data from metadata_path into metadata dictionary."""

        self.metadata = {}

        logging.info(f'Opening {metadata_path}')
        with open(metadata_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines: List[str] = f.readlines()  # Reads whole file into a list of lines
        logging.info(f'Read {metadata_path}')

        logging.info(f'Building metadata dictionary from {len(lines)} lines of {metadata_path}')
        curr_id = None
        discontinued_items: int = 0
        not_discontinued_items: int = 0
        total_items: int = 0
        i: int = 0

        while i < len(lines):
            line = lines[i].strip()
            if line.startswith('Id:'):  # New item
                total_items += 1

                # If discontinued, skip to next item
                if lines[i + 2].strip().startswith('discontinued'):
                    discontinued_items += 1
                    i += 4  # Skip to next item
                    continue

                # Else make a new Item object corresponding to the new ID
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

        logging.info(f'Finished building metadata dictionary from {len(lines)} lines of {metadata_path}')

        logging.info(f'Total items: {total_items}, Discontinued items: {discontinued_items}')

    def parse_graph(self, graph_path='./data/amazon0601.txt') -> None:
        """Parses data from graph_path into graph (adjacency list)."""

        logging.info(f'Opening {graph_path}')
        with open(graph_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = f.readlines()
        logging.info(f'Finished reading {graph_path}')

        self.graph_adj = {}
        self.graph_edgelist = []
        i = d = 0
        logging.info(f'Building graph from {len(data)} lines of {graph_path}')
        for line in data[4:]:
            frm, to = [x for x in line.strip().split()]
            if self.metadata and (frm not in self.metadata or to not in self.metadata):
                d += 1
                continue

            # Add edge to metadata dictionary
            if self.INCLUDE_GRAPH_IN_METADATA:
                if self.metadata[frm].recommendations_from_here:
                    self.metadata[frm].recommendations_from_here.append(to)
                else:
                    self.metadata[frm].recommendations_from_here = [to]

            # Add edge to graph_adj
            if frm not in self.graph_adj:
                self.graph_adj[frm] = [to]
            else:
                self.graph_adj[frm].append(to)

            # Add edge to graph_edgelist
            self.graph_edgelist.append([frm, to])

            i += 1

        logging.info(f'Finished building graph from {len(data)} lines of {graph_path}')
        logging.info(f'Read {i} edges, skipped {d} of them (one or both nodes were discontinued)')

    def dump_metadata_json(self, metadata_json_path='./frontend/src/assets/metadata.json'):
        """Writes JSON representation of metadata to metadata_json_path"""

        logging.info(f'Writing metadata to JSON file {metadata_json_path}')

        reformed_metadata = {key: vars(val) for (key, val) in self.metadata.items()}
        with open(metadata_json_path, 'w') as f:
            json.dump(reformed_metadata, f, indent=4)

    def dump_graph_json(self, graph_json_path='./frontend/src/assets/', ):
        """Writes JSON representation of edgelist and adjacency list graphs to graph_json_path"""

        # Write adjacency list
        adj_path = graph_json_path + 'graph-adj.json'
        logging.info(f'Writing graph to JSON file {adj_path}')
        with open(adj_path, "w") as f:
            json.dump(self.graph_adj, f, indent=4)

        # Write edgelist
        edgelist_path = graph_json_path + 'graph-edgelist.json'
        logging.info(f'Writing graph to JSON file {edgelist_path}')
        with open(edgelist_path, "w") as f:
            json.dump(self.graph_edgelist, f, indent=4)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.info('Started program')

    p = Parser()

    p.parse_metadata()
    p.parse_graph()

    p.dump_metadata_json()
    p.dump_graph_json()

    print(f"Metadata for item with ID 100: {vars(p.metadata['100'])}")
    print(f"Edges from item with ID 100: {p.graph_adj['100']}")
    print(f"Edge from edgelist index 100: {p.graph_edgelist[100]}")

    logging.info('Done')
