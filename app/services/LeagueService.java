package services;

import models.LeagueRow;
import utils.DB;

import java.sql.*;
import java.util.*;

public class LeagueService {

    public static List<LeagueRow> buildTable() {

        Map<String, LeagueRow> table = new HashMap<>();

        try (Connection conn = DB.getConnection()) {

            String sql = "SELECT * FROM matches";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {

                String home = rs.getString("home_team");
                String away = rs.getString("away_team");
                int homeGoals = rs.getInt("home_goals");
                int awayGoals = rs.getInt("away_goals");

                table.putIfAbsent(home, create(home));
                table.putIfAbsent(away, create(away));

                LeagueRow h = table.get(home);
                LeagueRow a = table.get(away);

                h.played++;
                a.played++;

                h.goalsFor += homeGoals;
                h.goalsAgainst += awayGoals;

                a.goalsFor += awayGoals;
                a.goalsAgainst += homeGoals;

                if (homeGoals > awayGoals) {
                    h.wins++;
                    h.points += 3;
                    a.losses++;
                }
                else if (awayGoals > homeGoals) {
                    a.wins++;
                    a.points += 3;
                    h.losses++;
                }
                else {
                    h.draws++;
                    a.draws++;
                    h.points += 1;
                    a.points += 1;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        List<LeagueRow> result = new ArrayList<>(table.values());

        result.sort((a, b) -> {

            if (b.points != a.points)
                return b.points - a.points;

            int gdA = a.goalsFor - a.goalsAgainst;
            int gdB = b.goalsFor - b.goalsAgainst;

            if (gdB != gdA)
                return gdB - gdA;

            if (b.goalsFor != a.goalsFor)
                return b.goalsFor - a.goalsFor;

            return b.wins - a.wins;
        });

        return result;
    }

    private static LeagueRow create(String team) {
        LeagueRow r = new LeagueRow();
        r.team = team;
        return r;
    }
}