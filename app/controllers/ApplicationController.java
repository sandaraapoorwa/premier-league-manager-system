package controllers;

import play.mvc.*;

public class ApplicationController extends Controller {

    public Result home() {
        return ok("Football Manager API Running ⚽");
    }
}