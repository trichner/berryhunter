# BerryHunter Wiki Generator

This tool takes game data from across the project and compiles into a format compatible for https://berryhunter.fandom.com/.

**State 2024:**
- https://berryhunter.fandom.com/ is dead
- fandom.com is an awful wiki with a bad reputation and massive amounts of advertisements
  - https://www.wiki.gg/ could be considered as alternative
- While this project is compiling & running, it has some issues
  - `change-case` 5+ is enforcing ESM projects. This doesn't seem to be easily compatible with ts-node

### extra-data.json

Values provided here override any data fetched from the API data.
Thus all values used in the template can be adjusted here per element 
(e.g. `name`) and new values can be introduced, too (e.g. `description`).
Factors, materials and tools can not be overridden to ensure correct 
values in the wiki. 

Special values:

- `"ignore"`: if set to true, will completely hide this element in the wiki
- `"noIcon"`: if set to true, will disable errors on missing icons

# Fandom Help

- [Getting Started](https://berryhunter.fandom.com/wiki/Help:Getting_Started)
- [How to Contribute](https://berryhunter.fandom.com/wiki/Help:Contributing)
- [Managing your new community](https://berryhunter.fandom.com/wiki/Help:Community_Management)
- [Guides](https://berryhunter.fandom.com/wiki/Help:Contents)
- [Al Help Articles](https://berryhunter.fandom.com/wiki/Help:Index)
- [Fandom's Community Central](https://community.fandom.com/wiki/)
