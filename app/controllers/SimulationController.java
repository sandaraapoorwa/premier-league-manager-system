package controllers;

import play.mvc.*;
import utils.DB;
import utils.TeamStrength;

import java.sql.*;

public class SimulationController extends Controller {

    public Result simulateMatches() {

        try (Connection conn = DB.getConnection()) {

            // 1. Get all matches
            String selectSql = "SELECT * FROM matches";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(selectSql);

            while (rs.next()) {

                long id = rs.getLong("id");

                String homeTeam = rs.getString("home_team");
                String awayTeam = rs.getString("away_team");

                // 2. Get team strengths
                double homeStrength = TeamStrength.getStrength(conn, homeTeam);
                double awayStrength = TeamStrength.getStrength(conn, awayTeam);

                // 3. Convert strength into realistic goals
                int homeGoals = (int) Math.max(0,
                        Math.round(homeStrength / 30 + Math.random() * 2));

                int awayGoals = (int) Math.max(0,
                        Math.round(awayStrength / 30 + Math.random() * 2));

                // 4. Update match in DB
                String updateSql =
                        "UPDATE matches SET home_goals = ?, away_goals = ? WHERE id = ?";

                PreparedStatement ps = conn.prepareStatement(updateSql);
                ps.setInt(1, homeGoals);
                ps.setInt(2, awayGoals);
                ps.setLong(3, id);

                ps.executeUpdate();
            }

            return ok("Matches simulated successfully + team strength applied");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}