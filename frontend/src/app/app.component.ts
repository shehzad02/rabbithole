import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as _ from "underscore";
import * as internal from 'stream';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';


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
export class AppComponent implements OnInit, AfterViewInit {
  metadata = new Map<string, Item>();
  graph = new Map<string, string[]>();

  filteredOptions: Item[] = [];
  suggestions: any = [];
  source: any;

  isChecked: boolean = false;

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
      // temporary
      this.suggestions = this.filteredOptions;
    });

    // puts the graph.json into a map
    this.httpClient.get("assets/graph.json").subscribe(adjList => {
      const result = Object.entries(adjList);
      result.forEach(list => {
        this.graph.set(list[0], list[1]);
      });
    });
  }

  ngAfterViewInit(): void {
      
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
    this.source = item;
    if (this.isChecked) {
      this.BFS(item);
    } else {
      this.DFS(item);
    }
  }

  viewItem(item: Item) {
    this.source = item;
    if (this.isChecked) {
      this.BFS(item);
    } else {
      this.DFS(item);
    }
  }

  filter(event: any) {
    let value: string = event.target.value;
    let count = 0;
    this.filteredOptions = [];
    let items = [...this.metadata.values()];
   
    for (let index = 0; index < items.length; index++) {
      if (items[index].title.toLowerCase().includes(value.toLowerCase())) {
        count++;
        this.filteredOptions.push(items[index]);
      }
      if (count === 10) {
        break;
      } 
    }
  }

}
