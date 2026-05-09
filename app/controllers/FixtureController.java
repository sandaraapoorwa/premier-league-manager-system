package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FixtureController extends Controller {

    public Result generateFixtures() {

        try (Connection conn = DB.getConnection()) {

            Statement stmt = conn.createStatement();

            // Get all teams
            ResultSet rs = stmt.executeQuery(
                    "SELECT name FROM teams"
            );

            List<String> teams = new ArrayList<>();

            while (rs.next()) {
                teams.add(rs.getString("name"));
            }

            // Clear old fixtures
            stmt.executeUpdate("DELETE FROM matches");

            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO matches (home_team, away_team, matchday) VALUES (?, ?, ?)"
            );

            int matchday = 1;
            int gamesPerRound = teams.size() / 2;
            int gameCount = 0;

            // ROUND ROBIN (no duplicates in same direction logic)
            for (int i = 0; i < teams.size(); i++) {

                for (int j = i + 1; j < teams.size(); j++) {

                    // Home match
                    ps.setString(1, teams.get(i));
                    ps.setString(2, teams.get(j));
                    ps.setInt(3, matchday);
                    ps.addBatch();

                    gameCount++;

                    if (gameCount % gamesPerRound == 0) {
                        matchday++;
                    }

                    // Away match
                    ps.setString(1, teams.get(j));
                    ps.setString(2, teams.get(i));
                    ps.setInt(3, matchday);
                    ps.addBatch();

                    gameCount++;

                    if (gameCount % gamesPerRound == 0) {
                        matchday++;
                    }
                }
            }

            ps.executeBatch();

            return ok("Fixtures generated successfully ⚽");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}