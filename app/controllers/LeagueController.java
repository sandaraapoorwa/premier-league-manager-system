package controllers;

import play.libs.Json;
import play.mvc.*;
import utils.DB;
import models.LeagueRow;

import java.sql.*;
import java.util.*;

public class LeagueController extends Controller {

    public Result getTable() {

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

                // ensure teams exist
                table.putIfAbsent(home, createRow(home));
                table.putIfAbsent(away, createRow(away));

                LeagueRow homeRow = table.get(home);
                LeagueRow awayRow = table.get(away);

                // played
                homeRow.played++;
                awayRow.played++;

                // goals logic
                homeRow.goalsFor += homeGoals;
                homeRow.goalsAgainst += awayGoals;

                awayRow.goalsFor += awayGoals;
                awayRow.goalsAgainst += homeGoals;

                if (homeGoals > awayGoals) {
                    homeRow.wins++;
                    homeRow.points += 3;
                    awayRow.losses++;
                }
                else if (homeGoals < awayGoals) {
                    awayRow.wins++;
                    awayRow.points += 3;
                    homeRow.losses++;
                }
                else {
                    homeRow.draws++;
                    awayRow.draws++;
                    homeRow.points += 1;
                    awayRow.points += 1;
                }
            }

            List<LeagueRow> result = new ArrayList<>(table.values());

            // sort by points (highest first)
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

            return ok(Json.toJson(result));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    private LeagueRow createRow(String team) {
        LeagueRow row = new LeagueRow();
        row.team = team;
        return row;
    }
}