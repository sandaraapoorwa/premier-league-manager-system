package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;

public class ResetSeasonController extends Controller {

    public Result resetSeason() {

        try (Connection conn = DB.getConnection()) {

            Statement stmt = conn.createStatement();

            // 1. Reset match scores
            stmt.executeUpdate(
                    "UPDATE matches SET home_goals = 0, away_goals = 0"
            );

            return ok("Season reset successfully");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}