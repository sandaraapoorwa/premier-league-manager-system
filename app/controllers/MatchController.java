package controllers;

import play.libs.Json;
import play.mvc.*;
import utils.DB;
import models.Match;
import com.fasterxml.jackson.databind.JsonNode;

import java.sql.*;
import java.util.*;

public class MatchController extends Controller {

    // CREATE MATCH
    public Result createMatch(Http.Request request) {

        JsonNode json = request.body().asJson();

        if (json == null) {
            return badRequest("Invalid JSON");
        }

        try (Connection conn = DB.getConnection()) {

            String sql = "INSERT INTO matches (home_team, away_team, home_goals, away_goals) VALUES (?, ?, ?, ?) RETURNING id";

            PreparedStatement stmt = conn.prepareStatement(sql);

            stmt.setString(1, json.get("homeTeam").asText());
            stmt.setString(2, json.get("awayTeam").asText());
            stmt.setInt(3, json.get("homeGoals").asInt());
            stmt.setInt(4, json.get("awayGoals").asInt());

            ResultSet rs = stmt.executeQuery();

            long id = 0;
            if (rs.next()) {
                id = rs.getLong("id");
            }

            Match match = new Match();
            match.id = id;
            match.homeTeam = json.get("homeTeam").asText();
            match.awayTeam = json.get("awayTeam").asText();
            match.homeGoals = json.get("homeGoals").asInt();
            match.awayGoals = json.get("awayGoals").asInt();

            return ok(Json.toJson(match));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }

    // GET ALL MATCHES
    public Result getMatches() {

        List<Match> matches = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {

            String sql = "SELECT * FROM matches";
            Statement stmt = conn.createStatement();

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                Match m = new Match();
                m.id = rs.getLong("id");
                m.homeTeam = rs.getString("home_team");
                m.awayTeam = rs.getString("away_team");
                m.homeGoals = rs.getInt("home_goals");
                m.awayGoals = rs.getInt("away_goals");

                matches.add(m);
            }

            return ok(Json.toJson(matches));

        } catch (Exception e) {
            return internalServerError(e.getMessage());
        }
    }
}