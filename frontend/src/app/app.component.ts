import { Component, OnInit } from '@angular/core';
import * as _ from "underscore";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // variable to store all of the amazon items
  options = ["hello", "world", "hello world", "frank", "super"];
  // variable to store the adjacency list
  graph = {};
  // varible to store the auto complete search
  filteredOptions: string[] = [];
  // result of the BFS or DFS
  suggestions = [];

  value = "";

  ngOnInit() {
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

    this.filteredOptions = _.filter(this.options, function(option) {return option.includes(event.target.value)});
  }

}
