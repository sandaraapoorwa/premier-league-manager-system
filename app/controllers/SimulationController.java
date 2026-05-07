package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.Random;

public class SimulationController extends Controller {

    public Result simulateMatches() {

        Random random = new Random();

        try (Connection conn = DB.getConnection()) {

            // 1. Get all matches
            String selectSql = "SELECT * FROM matches";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(selectSql);

            while (rs.next()) {

                long id = rs.getLong("id");

                int homeGoals = random.nextInt(6); // 0–5 goals
                int awayGoals = random.nextInt(6);

                // 2. Update match with scores
                String updateSql = "UPDATE matches SET home_goals = ?, away_goals = ? WHERE id = ?";

                PreparedStatement ps = conn.prepareStatement(updateSql);
                ps.setInt(1, homeGoals);
                ps.setInt(2, awayGoals);
                ps.setLong(3, id);

                ps.executeUpdate();
            }

            return ok("Matches simulated successfully ");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}