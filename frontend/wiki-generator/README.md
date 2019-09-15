### extra-data.json

Values provided here override any data fetched from the API data.
Thus all values used in the template can be adjusted here per element 
(e.g. `name`) and new values can be introduced, too (e.g. `description`).
Factors and materials can not be overridden to ensure correct values in 
the wiki. 

Special values:

- `"ignore"`: if set to true, will completely hide this element in the wiki
- `"noIcon"`: if set to true, will disable errors on missing icons