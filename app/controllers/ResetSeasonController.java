package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;

public class ResetSeasonController extends Controller {

    public Result resetSeason() {
        try (Connection conn = DB.getConnection()) {
            Statement stmt = conn.createStatement();

            stmt.executeUpdate(
                    "UPDATE matches SET home_goals = NULL, away_goals = NULL, goal_scorers = NULL"
            );

            return ok("Season reset successfully + shsshs");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}