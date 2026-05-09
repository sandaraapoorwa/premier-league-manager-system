package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.Random;

public class MatchdayController extends Controller {

    public Result playNextMatchday(int matchday) {

        Random random = new Random();

        try (Connection conn = DB.getConnection()) {

            PreparedStatement stmt = conn.prepareStatement(
                    "SELECT * FROM matches WHERE matchday = ? AND home_goals IS NULL"
            );

            stmt.setInt(1, matchday);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {

                long id = rs.getLong("id");

                String home = rs.getString("home_team");
                String away = rs.getString("away_team");

                int homeGoals = random.nextInt(4);
                int awayGoals = random.nextInt(4);

                PreparedStatement update = conn.prepareStatement(
                        "UPDATE matches SET home_goals=?, away_goals=? WHERE id=?"
                );

                update.setInt(1, homeGoals);
                update.setInt(2, awayGoals);
                update.setLong(3, id);

                update.executeUpdate();
            }

            return ok("Matchday " + matchday + " completed ⚽");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}