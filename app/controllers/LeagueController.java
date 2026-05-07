package controllers;

import play.libs.Json;
import play.mvc.*;
import services.LeagueService;

public class LeagueController extends Controller {

    public Result getTable() {

        return ok(Json.toJson(LeagueService.buildTable()));
    }
}