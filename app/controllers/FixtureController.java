package controllers;

import play.mvc.*;
import utils.DB;

import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FixtureController extends Controller {

    public Result generateFixtures() {

        try (Connection conn = DB.getConnection()) {

            Statement stmt = conn.createStatement();

            // Get all teams
            ResultSet rs = stmt.executeQuery("SELECT name FROM teams ORDER BY id");
            List<String> teams = new ArrayList<>();
            while (rs.next()) teams.add(rs.getString("name"));

            // Need even number of teams
            if (teams.size() % 2 != 0) teams.add("BYE");

            int n = teams.size();
            int rounds = n - 1;
            int matchesPerRound = n / 2;

            // Clear old fixtures
            stmt.executeUpdate("DELETE FROM matches");

            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO matches (home_team, away_team, matchday) VALUES (?, ?, ?)"
            );

            // ── First half of season ──
            for (int round = 0; round < rounds; round++) {
                int matchday = round + 1;

                for (int match = 0; match < matchesPerRound; match++) {
                    int home = (round + match) % (n - 1);
                    int away = (n - 1 - match + round) % (n - 1);

                    // Last team stays fixed
                    if (match == 0) away = n - 1;

                    String homeTeam = teams.get(home);
                    String awayTeam = teams.get(away);

                    if (homeTeam.equals("BYE") || awayTeam.equals("BYE")) continue;

                    ps.setString(1, homeTeam);
                    ps.setString(2, awayTeam);
                    ps.setInt(3, matchday);
                    ps.addBatch();
                }
            }

            // ── Second half of season (reverse fixtures) ──
            for (int round = 0; round < rounds; round++) {
                int matchday = rounds + round + 1;

                for (int match = 0; match < matchesPerRound; match++) {
                    int home = (round + match) % (n - 1);
                    int away = (n - 1 - match + round) % (n - 1);

                    if (match == 0) away = n - 1;

                    String homeTeam = teams.get(home);
                    String awayTeam = teams.get(away);

                    if (homeTeam.equals("BYE") || awayTeam.equals("BYE")) continue;

                    // Swap home/away for second half
                    ps.setString(1, awayTeam);
                    ps.setString(2, homeTeam);
                    ps.setInt(3, matchday);
                    ps.addBatch();
                }
            }

            ps.executeBatch();

            return ok("Fixtures generated successfully ⚽");

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}