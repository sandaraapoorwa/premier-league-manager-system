package controllers;

import play.libs.Json;
import play.mvc.*;
import models.Team;
import utils.DB;

import java.sql.*;
import java.util.*;

public class TeamController extends Controller {

    // GET ALL TEAMS
    public Result getTeams() {

        List<Team> teams = new ArrayList<>();

        try (Connection conn = DB.getConnection()) {

            String sql = "SELECT * FROM teams";

            Statement stmt = conn.createStatement();

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {

                Team team = new Team();

                team.id = rs.getLong("id");
                team.name = rs.getString("name");
                team.logo = rs.getString("logo");
                team.rating = rs.getInt("rating");
                team.attack = rs.getInt("attack");
                team.defense = rs.getInt("defense");

                teams.add(team);
            }

            return ok(Json.toJson(teams));

        } catch (Exception e) {

            return internalServerError(e.getMessage());
        }
    }
}