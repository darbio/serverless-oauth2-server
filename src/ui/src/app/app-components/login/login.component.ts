import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  alerts = [
    {
      type: "danger",
      msg: `Invalid username or password`,
      timeout: 5000
    }
  ];

  constructor() {}

  ngOnInit() {}
}
