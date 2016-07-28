"use strict";
const plugins = require("./npmdocker.plugins");
// directories
exports.cwd = process.cwd();
exports.packageBase = plugins.path.join(__dirname, "../");
exports.assets = plugins.path.join(exports.packageBase, "assets/");
plugins.smartfile.fs.ensureDirSync(exports.assets);
exports.dockerfile = plugins.path.join(exports.assets, "Dockerfile");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtZG9ja2VyLnBhdGhzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMvbnBtZG9ja2VyLnBhdGhzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFZLE9BQU8sV0FBTSxxQkFBcUIsQ0FBQyxDQUFBO0FBRS9DLGNBQWM7QUFDSCxXQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLG1CQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBVyxFQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdELE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFNLENBQUMsQ0FBQztBQUNoQyxrQkFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQU0sRUFBQyxZQUFZLENBQUMsQ0FBQyJ9