import { octokit, org } from "./git.auth.controller.js";
import queryString from "query-string";

const relInLinks = link => {
	var linkRegex = /\<([^>]+)/g;
	var relRegex = /rel="([^"]+)/g;
	var linkArray = [];
	var relArray = [];
	var finalResult = {};
	var temp;
	while ((temp = linkRegex.exec(link)) != null) {
		linkArray.push(temp[1]);
	}
	while ((temp = relRegex.exec(link)) != null) {
		relArray.push(temp[1]);
	}

	finalResult = relArray.reduce((object, value, index) => {
		object[value] = linkArray[index];
		return object;
	}, {});
	return queryString.parse(
		finalResult["last"].substring(finalResult["last"].indexOf("?"))
	).page;
};

export const getNumberOfPages = (of, team = null) => {
	if (of === "repoCollaborators") {
		return octokit.repos
			.listCollaborators({
				owner: org,
				repo: team,
				per_page: 100,
				page: 1
			})
			.then(data => ({
				pages: data.headers.hasOwnProperty("link")
					? relInLinks(data.headers.link)
					: 1
			}));
	} else if (of === "teams") {
		return octokit.teams
			.list({
				org,
				per_page: 100,
				page: 1
			})
			.then(data => ({
				pages: data.headers.hasOwnProperty("link")
					? relInLinks(data.headers.link)
					: 1
			}));
	} else if (of === "repos") {
		return octokit.repos
			.listForOrg({
				org,
				per_page: 100,
				page: 1
			})
			.then(data => ({
				pages: data.headers.hasOwnProperty("link")
					? relInLinks(data.headers.link)
					: 1
			}));
	} else if (of === "teamMembers") {
		return octokit.teams
			.listMembersInOrg({
				org,
				team_slug: team,
				per_page: 100,
				page: 1
			})
			.then(data => ({
				pages: data.headers.hasOwnProperty("link")
					? relInLinks(data.headers.link)
					: 1
			}));
	} else if (of === "orgs") {
		return octokit.orgs
			.listMembers({
				org,
				role: "all",
				per_page: 100,
				page: 1
			})
			.then(data => ({
				pages: data.headers.hasOwnProperty("link")
					? relInLinks(data.headers.link)
					: 1
			}));
	}
};
