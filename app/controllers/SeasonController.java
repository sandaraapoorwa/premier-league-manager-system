package controllers;

import play.mvc.*;
import utils.DB;
import utils.TeamStrength;

import java.sql.*;

public class SeasonController extends Controller {

    public Result playSeason() {

        try (Connection conn = DB.getConnection()) {

            Statement stmt = conn.createStatement();

            // 1. Get all matches
            ResultSet rs = stmt.executeQuery("SELECT * FROM matches");

            while (rs.next()) {

                long id = rs.getLong("id");

                String homeTeam = rs.getString("home_team");
                String awayTeam = rs.getString("away_team");

                // 2. Team strength
                double homeStrength = TeamStrength.getStrength(conn, homeTeam);
                double awayStrength = TeamStrength.getStrength(conn, awayTeam);

                // 3. Realistic goal simulation
                int homeGoals = (int) Math.max(0,
                        Math.round(homeStrength / 30 + Math.random() * 2));

                int awayGoals = (int) Math.max(0,
                        Math.round(awayStrength / 30 + Math.random() * 2));

                // 4. Update match
                PreparedStatement ps = conn.prepareStatement(
                        "UPDATE matches SET home_goals=?, away_goals=? WHERE id=?"
                );

                ps.setInt(1, homeGoals);
                ps.setInt(2, awayGoals);
                ps.setLong(3, id);

                ps.executeUpdate();
            }

            return ok(" Season completed successfully!");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}