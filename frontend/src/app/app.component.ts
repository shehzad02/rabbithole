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
  // variable to store the adjacency list
  metadata = new Map<string, Item>();
  // varible to store the auto complete search
  filteredOptions: string[] = [];
  // result of the BFS or DFS
  suggestions = [];

  // delete later
  value = "";

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
      console.log(this.metadata.get("1")?.title);
      
    })

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
