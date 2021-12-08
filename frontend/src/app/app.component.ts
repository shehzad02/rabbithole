import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as _ from "underscore";
import * as internal from 'stream';


export interface Item {
  id: string;
  asin: string;
  title: string;
  group: string;
  salesrank: number;
  num_ratings: number;
  avg_rating: number;
  similar_items: string[];
  recommendations_from_here: string[];
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  metadata = new Map<string, Item>();
  graph = new Map<string, string[]>();

  filteredOptions: Item[] = [];
  suggestions = [];

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    // puts the metadata.json into a map
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
      let it = [...this.metadata.values()];
      for (let index = 0; index < 5; index++) {
        this.filteredOptions.push(it[index]);
      }
    });

    // puts the graph.json into a map
    this.httpClient.get("assets/graph.json").subscribe(adjList => {
      const result = Object.entries(adjList);
      result.forEach(list => {
        this.graph.set(list[0], list[1]);
      });
    });
  }

  DFS(source: Item): void {
    
  }

  BFS(source: Item): void {
    
  }

  getOptionDisplay(option: Item) {
    return option.title;
  }

  selection(event: any) {
    let item: Item = event.option.value;
    
  }

  filter(event: any) {
    let value: string = event.target.value;
    // this.filteredOptions = [...this.metadata.values()].reduce(function(val) {
    //   if (val.title.toLowerCase().includes(value.toLowerCase())) {
    //     acc.push(val);
    //   }
    // })
    //this.filteredOptions = _.filter(this.options, function(option) {return option.toLowerCase().includes(value.toLowerCase())});
    //this.filteredOptions = _.filter([...this.metadata.values()], function(option) {return option.title.toLowerCase().includes(value.toLowerCase())});
    
  }

}
