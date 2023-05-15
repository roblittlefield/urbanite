A San Francisco government data mapping app, that makes API calls to SF.gov data API endpoints for 911 data and historic emergency reports. Includes "live" Police data, which is delayed 10 minutes and filtered for sensitive information (juvenile cases, suicide attempts, bomb threats, etc.) and updated every 10 minutes. In practice, it is generally 25-35 minutes delayed. App also uses SF Police historic data, which is produced once dispatches are closed and several days have passed, as well as Fire Dept historic data which does follows a similar posting pattern. Historic data available from 3 days ago back to 2016, but app limits calls to 150 items. 

Hosted on Netlify here to try: https://urbanitesf.netlify.app

