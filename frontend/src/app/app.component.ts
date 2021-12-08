import { Component, OnInit } from '@angular/core';
import * as _ from "underscore";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // variable to store all of the amazon items
  options = {};
  // variable to store the adjacency list
  graph = {};
  // varible to store the auto complete search
  filteredOptions = {};
  // result of the BFS or DFS
  suggestions = [];

  ngOnInit() {

  }

  DFS(): void {

  }

  BFS(): void {

  }

}
