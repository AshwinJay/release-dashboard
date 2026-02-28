* i have a list of services to release every week.
* each service needs to be released to multiple regions.
* each service could have code or config or both changing.
* services come from across multiple repositories.
* services can depend on other services as a feature or fix can span multiple services across repositories and thus require coordination when releasing.
* the list of services to release changes as not all need to be released every week.
* branches are cut on thursdays and labels are produced for all services across all repositories
* labels are to be deployed to a pre production environment and tested over the weekend
* on mondays the teams confirm if the services are ready to deploy
* services being released need a point of contact name who will perform the release
* service dependencies need to ensure that upstream is tested and deployed
* bugs may have been identified during the week that need fixing for one or more services. this results in labels changing for those serices
* it also means hotfix branches need to be cut from the release branch for those services that need fixing
* on mondays this consolidated list is reviewed and deployment window opened for teams to deploy their approved labels to their services - as code or config or both
* then they all confirm if the deployments succeeded across the services that were in the list
* then the release is declared done

propose a plan to intake, manage, coordinate and track these activities for a release manager.

the plan could involve building a dashboard or spreadsheet or marimo notebook or come up with an idea.

the release manager changes every week and the entire organization needs to be able to see this dashboard.

---

support dark and light mode, use OS default

---

can i make this save to a file instead? week by week

---

whats the bun command instead of npm


