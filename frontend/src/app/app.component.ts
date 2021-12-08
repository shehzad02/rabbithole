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
  // variable to store all of the amazon items
  options = ["hello", "world", "hello world", "frank", "super"];
  // variable to store the items available
  metadata = new Map<string, Item>();
  // variable to store the graph
  graph = new Map<string, string[]>();
  // varible to store the auto complete search
  filteredOptions: string[] = [];
  // result of the BFS or DFS
  suggestions = [];

  // delete later
  value = "";

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    // puts the metadata.json into a map
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
    });

    // puts the graph.json into a map
    this.httpClient.get("assets/graph.json").subscribe(adjList => {
      const result = Object.entries(adjList);
      result.forEach(list => {
        this.graph.set(list[0], list[1]);
      });
      console.log(this.graph.get("1"));
      
    });

    this.filteredOptions = this.options;
  }

  DFS(): void {

  }

  BFS(): void {

  }

  selection(event: any) {
    this.value = event.option.value;
  }

  filter(event: any) {
    let value: string = event.target.value;
    this.filteredOptions = _.filter(this.options, function(option) {return option.toLowerCase().includes(value.toLowerCase())});
  }

}
