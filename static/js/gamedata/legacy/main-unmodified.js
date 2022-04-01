Game = function(map, player1, player2, turn)
{
   this.player1 = player1;
   this.player2 = player2;
   this.NrOfPlayer = 2;
   this.world = new World(map,this);
   this.ai = _root.ai;
   this.ai.AiSystemCreate(this.world);
   this.player1.world = this.world;
   this.player2.world = this.world;
   this.Player_Neutral = null;
   this.currPlayer = this.player1;
   this.turn = turn;
   this.Round = 0;
   Object.registerClass("marker_mc",Marker);
   this.Marker = new Marker("marker_mc","marker",this.world);
   this.Marker.init(0,0);
};
Game.prototype.getPlayer = function(type)
{
   if(this.player1.type == type)
   {
      return this.player1;
   }
   if(this.player2.type == type)
   {
      return this.player2;
   }
   return this.Player_Neutral;
};
Game.prototype.getEnemyPlayer = function(player)
{
   if(this.player1 == player)
   {
      return this.player2;
   }
   if(this.player2 == player)
   {
      return this.player1;
   }
   trace("getEnemyPlayer ERROR!");
};
Game.prototype.captureCities = function(player)
{
   trace("captureCities()");
   var _loc3_ = null;
   for(var _loc5_ in this.world.cityList)
   {
      var _loc2_ = this.world.cityList[_loc5_];
      if(player.areEnemy(_loc2_))
      {
         _loc3_ = this.world.map.units[_loc2_.row][_loc2_.col];
         if(_loc3_ != null)
         {
            if(_loc3_.canCaptureCity() && player == _loc3_.getPlayer())
            {
               trace(_loc3_.type + " canCapture this City!");
               if(_loc2_.isNeutral())
               {
                  _loc2_.setPlayer(player);
               }
               else
               {
                  _loc3_.getHurt(1);
                  if(_loc2_.getType() == "Headquarter")
                  {
                     trace("!!! Headquarter lost, Game over !!!");
                     this.handleHeadquarterLost(_loc2_.getPlayer);
                  }
                  _loc2_.setPlayer(this.Player_Neutral);
               }
            }
         }
      }
   }
};
Game.prototype.handleHeadquarterLost = function()
{
   _root.GameStats.Winner = this.currPlayer.type;
   this.makeGameStats();
   if(_root.GameMode == "OnlineGame")
   {
      this.disableUserControl();
      var _loc3_ = _root.GameStats.Winner;
      var _loc4_ = _root.PlayerType;
      if(_loc3_ == _loc4_)
      {
         _root.GameMode = "WinOnlineGame";
      }
      else
      {
         _root.GameMode = "LooseOnlineGame";
      }
      _root.attention_mc._visible = true;
      _root.attention_mc.gotoAndPlay("sendData");
   }
   else
   {
      _root.gotoAndPlay("result");
   }
};
Game.prototype.collectIncome = function(player)
{
   trace("collectIncome( " + player.type + " )");
   for(var _loc5_ in this.world.cityList)
   {
      var _loc3_ = this.world.cityList[_loc5_];
      if(!player.areEnemy(_loc3_))
      {
         var _loc2_ = _loc3_.getGoldTurn();
         if(_loc2_ > 0)
         {
            player.funds = player.funds + _loc2_;
            trace("Gold: +" + _loc2_);
         }
      }
   }
};
Game.prototype.activateCities = function()
{
   this.Marker.move(58,58);
   for(var _loc3_ in this.world.cityList)
   {
      var _loc2_ = this.world.cityList[_loc3_];
      if(_loc2_.player == this.currPlayer)
      {
         _loc2_.mc.onPress = function()
         {
            trace("press own City: " + this.obj.type);
            this.world.game.SBshowCityInfo(this.obj);
         };
         if(_loc2_.getType() == "Headquarter")
         {
            this.Marker.setPos(_loc2_.row,_loc2_.col);
         }
      }
      else
      {
         delete _loc2_.mc.onPress;
      }
   }
};
Game.prototype.supportUnits = function()
{
   trace("supportUnits()");
   for(i in this.world.unitList)
   {
      var _loc2_ = this.world.unitList[i];
      if(_loc2_.getPlayer() == this.currPlayer)
      {
         var _loc3_ = this.world.getCity(_loc2_.row,_loc2_.col);
         if(_loc3_ != null && _loc3_.getPlayer() == this.currPlayer && _loc3_.checkSupplyCapabilities(_loc2_.getTypeCat()))
         {
            _loc2_.supportHP();
            _loc2_.supportFuelAmmo();
         }
         i = 0;
         while(i < 4)
         {
            switch(i)
            {
               case 0:
                  _loc3_ = this.world.getCity(_loc2_.row + 1,_loc2_.col);
                  break;
               case 1:
                  _loc3_ = this.world.getCity(_loc2_.row,_loc2_.col + 1);
                  break;
               case 2:
                  _loc3_ = this.world.getCity(_loc2_.row - 1,_loc2_.col);
                  break;
               case 3:
                  _loc3_ = this.world.getCity(_loc2_.row,_loc2_.col - 1);
            }
            if(_loc3_ != null && _loc3_.getPlayer() == this.currPlayer && _loc3_.checkSupplyCapabilities(_loc2_.getTypeCat()))
            {
               _loc2_.supportFuelAmmo();
            }
            i++;
         }
      }
   }
};
Game.prototype.activateUnits = function()
{
   for(var _loc5_ in this.world.unitList)
   {
      var _loc3_ = this.world.unitList[_loc5_];
      if(_loc3_.getPlayer() == this.currPlayer)
      {
         _loc3_.state = _loc3_.State_WaitingForOrder;
         _loc3_.setWarning();
         if(!_root.showActionList)
         {
            _loc3_.mc.onPress = function()
            {
               trace("PressUnitMC: " + this);
               this.world.game.SBshowUnitInfo(this.unit);
               this.world.createMovement(this.unit,true);
               var _loc2_ = this.world.createBattle(this.unit);
               if(_loc2_ != null)
               {
                  this.world.showBattles(this.unit);
               }
            };
         }
      }
      else
      {
         delete _loc3_.mc.onPress;
         _loc3_.delWarning();
         _loc3_.state = _loc3_.State_Finished;
      }
      _loc3_.showHitPoints();
   }
};
Game.prototype.enableUserControl = function()
{
   if(this.currPlayer.PLAYER_TYPE != TYPE_COMPUTER && !_root.showActionList)
   {
      trace("enableUserControl()");
      _global.USER_CONTROL = true;
      delete _root.blocker_mc.onPress;
   }
};
Game.prototype.disableUserControl = function()
{
   trace("disableUserControl()");
   _global.USER_CONTROL = false;
   _root.blocker_mc.onPress = function()
   {
      trace("User Control disabled!");
   };
   _root.blocker_mc.useHandCursor = false;
};
Game.prototype.setRound = function()
{
   this.turn = this.turn + 1;
   this.Round = Math.ceil(this.turn / 2);
   trace("Turn: " + this.turn + " Round: " + this.Round);
};
Game.prototype.setCurrPlayer = function()
{
   if(this.turn % this.NrOfPlayer == 1)
   {
      this.currPlayer = this.player1;
   }
   else
   {
      this.currPlayer = this.player2;
   }
   trace("setCurrPlayer: " + this.currPlayer.type);
};
Game.prototype.pressNextTurnBT = function()
{
   if(_root.GameMode == "newOnlineGame" || _root.GameMode == "OnlineGame")
   {
      this.disableUserControl();
      _root.attention_mc._visible = true;
      _root.attention_mc.gotoAndPlay("sendData");
      return undefined;
   }
   this.nextTurn();
   if(this.currPlayer.PLAYER_TYPE == TYPE_COMPUTER)
   {
      this.disableUserControl();
      this.ai.AiSystemExecute(this.currPlayer);
   }
};
Game.prototype.WaitForAi = function(game)
{
   if(game.ai.AiSystemDone)
   {
      trace("game.ai.AiSystemDone");
      clearInterval(_root.WaitForAiINT);
      game.nextTurn();
   }
};
Game.prototype.nextTurn = function()
{
   this.setRound();
   this.setCurrPlayer();
   this.world.destroyBattle();
   this.world.clearMovement();
   this.makeGameStats();
   if(this.Round > 1)
   {
      this.collectIncome(this.currPlayer);
      this.captureCities(this.currPlayer);
   }
   this.supportUnits();
   this.activateUnits();
   this.activateCities();
   this.SBshowPlayerInfo();
   if(this.currPlayer.PLAYER_TYPE == TYPE_HUMAN)
   {
      this.playGameMusic(this.currPlayer);
      this.promtMessageWindow(_root.LanguageObj.ID_185);
   }
};
Game.prototype.startGame = function()
{
   this.setRound();
   this.world.build();
   this.disableUserControl();
   _root.PlayerType = this.currPlayer.getType();
   this.activateUnits();
   this.activateCities();
   this.SBshowPlayerInfo();
   this.playGameMusic(this.currPlayer);
};
Game.prototype.playGameMusic = function(player)
{
   var _loc3_ = this.checkGameStatus(player);
   trace(_loc3_ + "% HitPoints");
   if(MUSIC)
   {
      _level9000.MenuMusic_obj.stop("menu");
      _root.MenuMusicPlays = false;
      if(_loc3_ <= 40)
      {
         if(_root.GameMusicPlays != 3)
         {
            _root.GameMusicPlays = 3;
            _level9000.GameMusic_obj.stop("ritter01");
            _level9000.GameMusic_obj.stop("ritter02");
            _level9000.initSound("GameMusic_mc","GameMusic_obj",9000,"ritter03",100,9999);
         }
      }
      else if(_loc3_ >= 60)
      {
         if(_root.GameMusicPlays != 2)
         {
            _root.GameMusicPlays = 2;
            _level9000.GameMusic_obj.stop("ritter01");
            _level9000.GameMusic_obj.stop("ritter03");
            _level9000.initSound("GameMusic_mc","GameMusic_obj",9000,"ritter02",100,9999);
         }
      }
      else if(_root.GameMusicPlays != 1)
      {
         _root.GameMusicPlays = 1;
         _level9000.GameMusic_obj.stop("ritter03");
         _level9000.GameMusic_obj.stop("ritter02");
         _level9000.initSound("GameMusic_mc","GameMusic_obj",9000,"ritter01",100,9999);
      }
   }
};
Game.prototype.checkGameStatus = function(player)
{
   var _loc4_ = 1;
   var _loc3_ = 1;
   for(var _loc5_ in this.world.unitList)
   {
      var _loc2_ = this.world.unitList[_loc5_];
      switch(_loc2_.getOwner())
      {
         case "crusader":
            _loc4_ = _loc4_ + _loc2_.getHP();
            break;
         case "sarazen":
            _loc3_ = _loc3_ + _loc2_.getHP();
      }
   }
   var _loc6_ = 0;
   switch(player.getType())
   {
      case "crusader":
         _loc6_ = Math.round(_loc4_ * 100 / (_loc4_ + _loc3_));
         break;
      case "sarazen":
         _loc6_ = Math.round(_loc3_ * 100 / (_loc4_ + _loc3_));
   }
   return _loc6_;
};
Game.prototype.deleteGame = function()
{
   trace("deleteGame!!!");
   for(var _loc3_ in this.world.loc)
   {
      var _loc2_ = this.world.loc[_loc3_];
      removeMovieClip(_loc2_);
   }
   delete this.world;
   delete this.player1;
   delete this.player2;
   false;
};
Game.prototype.makeGameStats = function()
{
   trace("makeGameStats()");
   var _loc3_ = _root.GameStats;
   _loc3_.Round = this.Round;
   trace("turn: " + this.turn + " Round: " + this.Round);
   _loc3_.units_cr = 0;
   _loc3_.hp_cr = 0;
   _loc3_.units_sa = 0;
   _loc3_.hp_sa = 0;
   for(var _loc7_ in this.world.unitList)
   {
      switch(this.world.unitList[_loc7_].getOwner())
      {
         case "crusader":
            _loc3_.units_cr = _loc3_.units_cr + 1;
            _loc3_.hp_cr = _loc3_.hp_cr + this.world.unitList[_loc7_].getHP();
            break;
         case "sarazen":
            _loc3_.units_sa = _loc3_.units_sa + 1;
            _loc3_.hp_sa = _loc3_.hp_sa + this.world.unitList[_loc7_].getHP();
      }
   }
   trace("unitsStat:" + _loc3_.units_cr + ":" + _loc3_.units_sa);
   if(this.player1.getType() == "crusader")
   {
      _loc3_.gold_cr = this.player1.getGold();
      _loc3_.gold_sa = this.player2.getGold();
   }
   else if(this.player1.getType() == "sarazen")
   {
      _loc3_.gold_cr = this.player2.getGold();
      _loc3_.gold_sa = this.player1.getGold();
   }
   else
   {
      trace("GameStats ERROR !!!");
   }
   trace("obj.Winner: " + _loc3_.Winner);
   if(_loc3_.Winner != null)
   {
      var _loc5_ = 0;
      var _loc6_ = 0;
      var _loc8_ = 200;
      if(_loc3_.Winner == "crusader")
      {
         var _loc4_ = (_loc8_ - _loc3_.Round) / (_loc3_.units_cr + 1);
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         var _loc10_ = _loc3_.units_cr * 100 / (_loc3_.units_cr + _loc3_.loose_cr);
         var _loc9_ = _loc4_ * (_loc3_.gold_cr + _loc3_.gold_sa);
         var _loc11_ = _loc4_ * _loc10_;
         _loc5_ = Math.round(_loc9_ + _loc11_);
         trace("score_cr: " + _loc5_);
         _loc3_.score = _loc5_;
         _root.punkte = _loc5_;
      }
      else if(_loc3_.Winner == "sarazen")
      {
         _loc4_ = (_loc8_ - _loc3_.Round) / (_loc3_.units_sa + 1);
         if(_loc4_ < 1)
         {
            _loc4_ = 1;
         }
         _loc10_ = _loc3_.units_sa * 100 / (_loc3_.units_sa + _loc3_.loose_sa);
         _loc9_ = _loc4_ * (_loc3_.gold_cr + _loc3_.gold_sa);
         _loc11_ = _loc4_ * _loc10_;
         _loc6_ = Math.round(_loc9_ + _loc11_);
         trace("score_sa: " + _loc6_);
         _loc3_.score = _loc6_;
         _root.punkte = _loc6_;
      }
   }
};
Game.prototype.addDefeatToGameStats = function(player)
{
   var _loc2_ = _root.GameStats;
   switch(player.type)
   {
      case "crusader":
         _loc2_.win_sa = _loc2_.win_sa + 1;
         _loc2_.loose_cr = _loc2_.loose_cr + 1;
         break;
      case "sarazen":
         _loc2_.win_cr = _loc2_.win_cr + 1;
         _loc2_.loose_sa = _loc2_.loose_sa + 1;
   }
};
Game.prototype.handleCapitulation = function()
{
   trace("handleCapitulation");
   _root.GameStats.Winner = this.currPlayer.getEnemyType();
   this.makeGameStats();
   _root.GameStats.score = 1000;
   this.deleteGame();
   _root.gotoAndPlay("result");
};
Game.prototype.promtMessageWindow = function(message)
{
   this.disableUserControl();
   var _loc3_ = _root.attention_mc;
   _loc3_.ausgabe = message;
   _loc3_.gotoAndPlay("promt");
   _loc3_._visible = true;
};
Game.prototype.startOnlineGame = function()
{
   trace("Game.startOnlineGame()");
   this.setRound();
   this.world.build();
   this.makeUnitList();
   this.disableUserControl();
   _root.PlayerType = this.currPlayer.getType();
   this.activateUnits();
   this.activateCities();
   this.SBshowPlayerInfo();
   this.captureCities(this.currPlayer);
   this.enableUserControl();
   this.playGameMusic(this.currPlayer);
};
Game.prototype.resumeOnlineGame = function()
{
   trace("Game.resumeOnlineGame()");
   this.disableUserControl();
   this.updateGameData();
   this.world.build();
   this.setCurrPlayer();
   this.updateCitiesData();
   this.updateUnitsData();
   this.SBshowPlayerInfo();
   _root.showActionList = true;
   this.activateUnits();
   var _loc4_ = 3000;
   _root.ActionINT = setInterval(this.doAction,_loc4_,this);
   var _loc3_ = this.getEnemyPlayer(this.currPlayer);
   this.playGameMusic(_loc3_);
};
Game.prototype.OnlineGameReady = function()
{
   trace("OnlineGameReady()");
   this.makeUnitList();
   if(!this.Headquarter())
   {
      trace("next Player has no HQ! no next Turn!");
      var _loc3_ = this.getEnemyPlayer(this.currPlayer);
      _root.PlayerType = _loc3_.getType();
      this.Round = Math.ceil(this.turn / 2);
      this.handleHeadquarterLost();
      return undefined;
   }
   this.nextTurn();
   _root.PlayerType = this.currPlayer.getType();
   this.enableUserControl();
};
Game.prototype.Headquarter = function()
{
   var _loc3_ = this.getEnemyPlayer(this.currPlayer);
   for(i in this.world.cityList)
   {
      var _loc2_ = this.world.cityList[i];
      if(_loc2_.type == "Headquarter" && _loc2_.player == _loc3_)
      {
         return true;
      }
   }
   return false;
};
Game.prototype.makeUnitList = function()
{
   trace("Game.makeUnitList()");
   _root.UnitList = [];
   var _loc8_ = this.world.unitList;
   for(i in _loc8_)
   {
      var _loc3_ = _loc8_[i];
      var _loc6_ = _loc3_.getTypeID();
      if(_loc3_.owner == "crusader")
      {
         var _loc5_ = 1;
      }
      else
      {
         _loc5_ = 2;
      }
      if(_loc3_.fuel == "endless")
      {
         var _loc7_ = -1;
      }
      else
      {
         _loc7_ = _loc3_.fuel;
      }
      if(_loc3_.ammo == "endless")
      {
         var _loc4_ = -1;
      }
      else
      {
         _loc4_ = _loc3_.ammo;
      }
      _root.UnitList.push(_loc3_.unitID + "*" + _loc5_ + "*" + _loc6_ + "*" + _loc3_.row + "-" + _loc3_.col + "*" + _loc3_.hitPoints + "*" + _loc4_ + "*" + _loc7_);
   }
};
Game.prototype.updateGameData = function()
{
   trace("Game.updateGameData()");
   this.turn = int(_root.GameDetails.roundcount);
};
Game.prototype.updateCitiesData = function()
{
   trace("Game.updateCitiesData()");
   for(i in _root.BuildingList)
   {
      var _loc4_ = _root.BuildingList[i];
      for(z in this.world.cityList)
      {
         var _loc3_ = this.world.cityList[z];
         if(_loc3_.id == int(_loc4_.cityID))
         {
            var _loc5_ = 0;
            var _loc6_ = 1;
            var _loc7_ = 2;
            switch(int(_loc4_.status))
            {
               case _loc5_:
                  _loc3_.owner = "no";
                  break;
               case _loc6_:
                  _loc3_.owner = "crusader";
                  break;
               case _loc7_:
                  _loc3_.owner = "sarazen";
            }
            _loc3_.setPlayer(this.getPlayer(_loc3_.owner));
         }
      }
   }
};
Game.prototype.updateUnitsData = function()
{
   trace("Game.updateUnitsData()");
   for(i in _root.UnitList)
   {
      var _loc4_ = _root.UnitList[i];
      for(z in this.world.unitList)
      {
         var _loc3_ = this.world.unitList[z];
         if(_loc3_.unitID >= this.world.unitIDcounter)
         {
            this.world.unitIDcounter = _loc3_.unitID + 1;
         }
         if(_loc3_.unitID == int(_loc4_.unitID))
         {
            if(_loc4_.fuel == "-1")
            {
               _loc3_.fuel = "endless";
            }
            else
            {
               _loc3_.fuel = int(_loc4_.fuel);
            }
            if(_loc4_.ammo == "-1")
            {
               _loc3_.ammo = "endless";
            }
            else
            {
               _loc3_.ammo = int(_loc4_.ammo);
            }
         }
      }
   }
};
Game.prototype.doAction = function(game)
{
   trace("Game.doAction()");
   clearInterval(_root.ActionINT);
   game.disableUserControl();
   removeMovieClip(game.world.loc.battle_mc);
   trace("ActionList.length: " + _root.ActionList.length);
   if(_root.ActionList.length > 0)
   {
      _root.showActionList = true;
      var _loc3_ = _root.ActionList.pop();
      var _loc5_ = 500;
      var _loc10_ = int(_loc3_.action);
      trace("actionID: " + _loc10_);
      var _loc18_ = 1;
      var _loc14_ = 2;
      var _loc16_ = 3;
      switch(_loc10_)
      {
         case _loc18_:
            trace("MOVE unit: " + _loc3_.unitID + " pos: " + _loc3_.unitPos);
            var _loc20_ = int(_loc3_.unitID);
            var _loc9_ = game.getUnitByID(_loc20_);
            var _loc4_ = _loc3_.unitPos.split("-");
            var _loc15_ = int(_loc4_[0]);
            var _loc21_ = int(_loc4_[1]);
            game.Marker.setPos(_loc4_[0],_loc4_[1]);
            game.world.createMovement(_loc9_,true);
            _loc9_.move(_loc15_,_loc21_);
            _loc5_ = _loc5_ + (game.world.Path.length + 1) * 300;
            break;
         case _loc14_:
            trace("FIGHT unit: " + _loc3_.unitID + " enemy: " + _loc3_.enemyID + " result: " + _loc3_.result);
            var _loc6_ = game.getUnitByID(_loc3_.unitID);
            var _loc7_ = game.getUnitByID(_loc3_.enemyID);
            var _loc8_ = _loc3_.result.split("-");
            var _loc19_ = int(_loc8_[0]);
            var _loc13_ = int(_loc8_[1]);
            game.Marker.setPos(_loc6_.row,_loc6_.col);
            game.markEnemy(_loc7_.row,_loc7_.col);
            game.world.displayBattleFromList(_loc6_,_loc7_,_loc19_,_loc13_);
            _loc5_ = _loc5_ + 3000;
            break;
         case _loc16_:
            trace("BUY unit: " + _loc3_.unitID + " type: " + _loc3_.unitType + " city: " + _loc3_.cityID);
            var _loc12_ = int(_loc3_.cityID);
            _loc20_ = int(_loc3_.unitID);
            _loc4_ = game.getCityPos(_loc12_);
            var _loc11_ = game.getUnitTypeName(int(_loc3_.unitType));
            var _loc17_ = _root[_loc11_].price;
            game.Marker.setPos(_loc4_[0],_loc4_[1]);
            game.currPlayer.funds = game.currPlayer.funds + _loc17_;
            game.currPlayer.buyUnit(_loc11_,_loc4_[0],_loc4_[1],_loc20_);
            break;
         default:
            trace("ERROR unknown ACTION!!!");
      }
      trace("setInterval( this.doAction, " + _loc5_ + " )");
      _root.ActionINT = setInterval(game.doAction,_loc5_,game);
   }
   _root.showActionList = false;
   game.OnlineGameReady();
   return undefined;
};
Game.prototype.markEnemy = function(row, col)
{
   trace("markEnemy( " + row + ", " + col + " )");
   var _loc2_ = {_y:row * 58,_x:col * 58};
   this.world.loc.attachMovie("battle_mc","battle_mc",23666,_loc2_);
};
Game.prototype.endOnlineGame = function()
{
   trace("endOnlineGame()");
   clearInterval(_root.endOnlineGameINT);
   var _loc2_ = _root.GameStats.Winner;
   var _loc3_ = _root.PlayerType;
   if(_loc2_ == _loc3_)
   {
      _root.GameMode = "WinOnlineGame";
   }
   else
   {
      _root.GameMode = "LooseOnlineGame";
   }
   _root.attention_mc._visible = true;
   _root.attention_mc.gotoAndPlay("sendData");
};
Game.prototype.getUnitByID = function(unitID)
{
   trace("getUnitByID( " + unitID + " )");
   for(i in this.world.unitList)
   {
      var _loc2_ = this.world.unitList[i];
      if(_loc2_.unitID == unitID)
      {
         trace("unit found: " + _loc2_.unitID);
         return _loc2_;
      }
   }
};
Game.prototype.getUnitTypeName = function(TypeID)
{
   for(i in _root.UnitDataObjects)
   {
      var _loc2_ = _root.UnitDataObjects[i];
      if(_loc2_.ID == TypeID)
      {
         return _loc2_.name;
      }
   }
};
Game.prototype.getCityPos = function(CityID)
{
   for(i in this.world.cityList)
   {
      var _loc2_ = this.world.cityList[i];
      if(_loc2_.id == CityID)
      {
         var _loc3_ = new Array(_loc2_.row,_loc2_.col);
         return _loc3_;
      }
   }
};
Game.prototype.SBshowPlayerInfo = function()
{
   var _loc2_ = this.currPlayer;
   sidebar_mc.player = _loc2_.name;
   sidebar_mc.money = _loc2_.getGold();
   sidebar_mc.gotoAndPlay(1);
};
Game.prototype.SBshowRollOverInfo = function(row, col)
{
   var _loc3_ = _root.sidebar_mc;
   var _loc4_ = this.world.map.units[row][col];
   var _loc9_ = _loc4_.getTypeLang();
   var _loc6_ = _loc4_.getFuel();
   var _loc5_ = _loc4_.getAmmo();
   if(_loc6_ == "endless")
   {
      _loc6_ = "++";
   }
   if(_loc5_ == "endless")
   {
      _loc5_ = "++";
   }
   if(_loc9_)
   {
      _loc3_.ro_unit = _loc9_;
      _loc3_.ro_unit_hp = _loc4_.getHP();
      _loc3_.ro_unit_fuel = _loc6_;
      _loc3_.ro_unit_ammo = _loc5_;
   }
   else
   {
      _loc3_.ro_unit = "-";
      _loc3_.ro_unit_hp = "-";
      _loc3_.ro_unit_fuel = "-";
      _loc3_.ro_unit_ammo = "-";
   }
   var _loc10_ = this.world.map.cities[row][col];
   var _loc8_ = this.world.cityList[_loc10_].getNameLang();
   if(_loc8_)
   {
      _loc3_.ro_city = _loc8_;
      _loc3_.ro_city_bb = this.world.cityList[_loc10_].getBattleBonus();
   }
   else
   {
      _loc3_.ro_city = "-";
      _loc3_.ro_city_bb = "-";
   }
   _loc3_.ro_terrain = this.world.map.terrain[row][col].getNameLang();
   _loc3_.ro_terrain_defence = this.world.map.terrain[row][col].defence;
};
Game.prototype.SBshowCityInfo = function(city)
{
   trace("Game.SBshowCityInfo( " + city.getName() + " )");
   var _loc4_ = _root.sidebar_mc;
   var _loc8_ = city.getModel();
   var _loc9_ = city.getPlayer();
   _loc4_.money = _loc9_.getGold();
   _loc4_.gotoAndPlay("info_city");
   _loc4_.prev_mc.attachMovie(_loc8_,"prev",1);
   _loc4_.prev_header = city.getNameLang();
   _loc4_.city_info_mc.gold_turn = "+" + city.getGoldTurn();
   _loc4_.city_info_mc.sup_head = _root.LanguageObj.ID_176;
   var _loc5_ = [];
   if(city.checkSupplyCapabilities("Human"))
   {
      _loc5_.push(_root.LanguageObj.ID_34);
   }
   if(city.checkSupplyCapabilities("Soft"))
   {
      _loc5_.push(_root.LanguageObj.ID_35);
   }
   if(city.checkSupplyCapabilities("Hard"))
   {
      _loc5_.push(_root.LanguageObj.ID_36);
   }
   if(city.checkSupplyCapabilities("Air"))
   {
      _loc5_.push(_root.LanguageObj.ID_37);
   }
   if(city.checkSupplyCapabilities("Water"))
   {
      _loc5_.push(_root.LanguageObj.ID_38);
   }
   var _loc3_ = 0;
   while(_loc3_ < 5)
   {
      if(_loc5_[_loc3_])
      {
         _loc4_.city_info_mc["sup_cat_0" + (_loc3_ + 1)] = _loc5_[_loc3_];
      }
      else
      {
         _loc4_.city_info_mc["sup_cat_0" + (_loc3_ + 1)] = "-";
      }
      _loc3_ = _loc3_ + 1;
   }
   var _loc7_ = city.getName();
   if(_loc7_ != "Headquarter" && _loc7_ != "Town" && _loc7_ != "Village")
   {
      _loc4_.city_info_mc.kaufen_head = _root.LanguageObj.ID_153;
      _loc4_.city_info_mc.catalog_mc.gotoAndPlay(_loc7_);
      _loc4_.city_info_mc.catalog_mc.city = city;
      _loc4_.city_info_mc.catalog_mc.world = this.world;
   }
   else
   {
      _loc4_.city_info_mc.kaufen_head = "";
      _loc4_.city_info_mc.catalog_mc.gotoAndPlay(1);
   }
};
Game.prototype.SBshowUnitInfo = function(unit)
{
   var _loc2_ = _root.sidebar_mc;
   var _loc6_ = unit.getModel();
   var _loc7_ = unit.getPlayer();
   _loc2_.money = _loc7_.getGold();
   _loc2_.gotoAndPlay("info_unit");
   _loc2_.prev_mc.attachMovie(_loc6_,"prev",1);
   _loc2_.prev_mc.prev.nr_bg._visible = false;
   _loc2_.prev_mc.prev.hp_txt.text = "";
   _loc2_.prev_header = unit.getTypeLang();
   var _loc4_ = unit.getAmmo();
   if(_loc4_ == "endless")
   {
      _loc4_ = "++";
   }
   var _loc5_ = unit.getFuel();
   if(_loc5_ == "endless")
   {
      _loc5_ = "++";
   }
   _loc2_.unit_info_mc.category = unit.getTypeCatLang();
   _loc2_.unit_info_mc.hp = unit.getHP();
   _loc2_.unit_info_mc.ammo = _loc4_;
   _loc2_.unit_info_mc.fuel = _loc5_;
   _loc2_.unit_info_mc.move = unit.getMovePoints();
   _loc2_.unit_info_mc.init = unit.getInitiative();
   _loc2_.unit_info_mc.frange = unit.getRange();
   _loc2_.unit_info_mc.cost = unit.getPrice();
   _loc2_.unit_info_mc.hu1 = unit.getNumberOfFights("Human",0);
   _loc2_.unit_info_mc.hu2 = unit.getNumberOfFights("Human",1);
   _loc2_.unit_info_mc.so1 = unit.getNumberOfFights("Soft",0);
   _loc2_.unit_info_mc.so2 = unit.getNumberOfFights("Soft",1);
   _loc2_.unit_info_mc.ha1 = unit.getNumberOfFights("Hard",0);
   _loc2_.unit_info_mc.ha2 = unit.getNumberOfFights("Hard",1);
   _loc2_.unit_info_mc.ai1 = unit.getNumberOfFights("Air",0);
   _loc2_.unit_info_mc.ai2 = unit.getNumberOfFights("Air",1);
   _loc2_.unit_info_mc.wa1 = unit.getNumberOfFights("Water",0);
   _loc2_.unit_info_mc.wa2 = unit.getNumberOfFights("Water",1);
};
Game.prototype.SBgetStatistik = function()
{
   var _loc3_ = _root.sidebar_mc.statistik_mc;
   _loc3_.hq0 = 0;
   _loc3_.hq1 = 0;
   _loc3_.hq2 = 0;
   _loc3_.ap0 = 0;
   _loc3_.ap1 = 0;
   _loc3_.ap2 = 0;
   _loc3_.tw0 = 0;
   _loc3_.tw1 = 0;
   _loc3_.tw2 = 0;
   _loc3_.vl0 = 0;
   _loc3_.vl1 = 0;
   _loc3_.vl2 = 0;
   _loc3_.hb0 = 0;
   _loc3_.hb1 = 0;
   _loc3_.hb2 = 0;
   _loc3_.fc0 = 0;
   _loc3_.fc1 = 0;
   _loc3_.fc2 = 0;
   _loc3_.ba0 = 0;
   _loc3_.ba1 = 0;
   _loc3_.ba2 = 0;
   _loc3_.st0 = 0;
   _loc3_.st1 = 0;
   _loc3_.st2 = 0;
   for(var _loc7_ in this.world.cityList)
   {
      var _loc4_ = this.world.cityList[_loc7_];
      var _loc6_ = _loc4_.getType();
      if(_loc6_ == "Headquarter")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.hq1 = _loc3_.hq1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.hq2 = _loc3_.hq2 + 1;
         }
         else
         {
            _loc3_.hq0 = _loc3_.hq0 + 1;
         }
      }
      if(_loc6_ == "Airport")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.ap1 = _loc3_.ap1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.ap2 = _loc3_.ap2 + 1;
         }
         else
         {
            _loc3_.ap0 = _loc3_.ap0 + 1;
         }
      }
      if(_loc6_ == "Town")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.tw1 = _loc3_.tw1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.tw2 = _loc3_.tw2 + 1;
         }
         else
         {
            _loc3_.tw0 = _loc3_.tw0 + 1;
         }
      }
      if(_loc6_ == "Village")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.vl1 = _loc3_.vl1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.vl2 = _loc3_.vl2 + 1;
         }
         else
         {
            _loc3_.vl0 = _loc3_.vl0 + 1;
         }
      }
      if(_loc6_ == "Harbour")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.hb1 = _loc3_.hb1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.hb2 = _loc3_.hb2 + 1;
         }
         else
         {
            _loc3_.hb0 = _loc3_.hb0 + 1;
         }
      }
      if(_loc6_ == "Factory")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.fc1 = _loc3_.fc1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.fc2 = _loc3_.fc2 + 1;
         }
         else
         {
            _loc3_.fc0 = _loc3_.fc0 + 1;
         }
      }
      if(_loc6_ == "Barracks")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.ba1 = _loc3_.ba1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.ba2 = _loc3_.ba2 + 1;
         }
         else
         {
            _loc3_.ba0 = _loc3_.ba0 + 1;
         }
      }
      if(_loc6_ == "LightFactory")
      {
         if(_loc4_.getOwner() == "sarazen")
         {
            _loc3_.st1 = _loc3_.st1 + 1;
         }
         else if(_loc4_.getOwner() == "crusader")
         {
            _loc3_.st2 = _loc3_.st2 + 1;
         }
         else
         {
            _loc3_.st0 = _loc3_.st0 + 1;
         }
      }
   }
   _loc3_.if0 = 0;
   _loc3_.if1 = 0;
   _loc3_.kv0 = 0;
   _loc3_.kv1 = 0;
   _loc3_.at0 = 0;
   _loc3_.at1 = 0;
   _loc3_.lw0 = 0;
   _loc3_.lw1 = 0;
   _loc3_.wt0 = 0;
   _loc3_.wt1 = 0;
   for(var _loc7_ in this.world.unitList)
   {
      var _loc5_ = this.world.unitList[_loc7_];
      if(_loc5_.getTypeCat() == "Human")
      {
         if(_loc5_.getOwner() == "sarazen")
         {
            _loc3_.if0 = _loc3_.if0 + 1;
         }
         else if(_loc5_.getOwner() == "crusader")
         {
            _loc3_.if1 = _loc3_.if1 + 1;
         }
      }
      if(_loc5_.getTypeCat() == "Soft")
      {
         if(_loc5_.getOwner() == "sarazen")
         {
            _loc3_.kv0 = _loc3_.kv0 + 1;
         }
         else if(_loc5_.getOwner() == "crusader")
         {
            _loc3_.kv1 = _loc3_.kv1 + 1;
         }
      }
      if(_loc5_.getTypeCat() == "Hard")
      {
         if(_loc5_.getOwner() == "sarazen")
         {
            _loc3_.at0 = _loc3_.at0 + 1;
         }
         else if(_loc5_.getOwner() == "crusader")
         {
            _loc3_.at1 = _loc3_.at1 + 1;
         }
      }
      if(_loc5_.getTypeCat() == "Air")
      {
         if(_loc5_.getOwner() == "sarazen")
         {
            _loc3_.lw0 = _loc3_.lw0 + 1;
         }
         else if(_loc5_.getOwner() == "crusader")
         {
            _loc3_.lw1 = _loc3_.lw1 + 1;
         }
      }
      if(_loc5_.getTypeCat() == "Water")
      {
         if(_loc5_.getOwner() == "sarazen")
         {
            _loc3_.wt0 = _loc3_.wt0 + 1;
         }
         else if(_loc5_.getOwner() == "crusader")
         {
            _loc3_.wt1 = _loc3_.wt1 + 1;
         }
      }
   }
   _loc3_.round = _root.LanguageObj.ID_165 + " " + this.Round;
};
World = function(map, game)
{
   this.game = game;
   this.loc = _root.stage_mc;
   this.locX = this.loc._x;
   this.locY = this.loc._y;
   this.mask = _root.mask_mc;
   this.gridsize = 58;
   this.Battle_LuckValue = 6;
   this.map = map;
   this.map.movement = this.buildMovementMap();
   this.rows = this.map.terrain.length;
   this.cols = this.map.terrain[0].length;
   this.unitIDcounter = 0;
   this.cityList = this.buildCityList();
   this.unitList = this.buildUnitList();
   this.BattleFX_StartLevel = 6000;
   this.Editor_StartLevel = 5000;
   this.Units_StartLevel = 4000;
   this.Battle_StartLevel = 3800;
   this.Movement_StartLevel = 3000;
   this.Cities_StartLevel = 2000;
   this.Terrain_StartLevel = 0;
   this.BattleINT = null;
};
World.prototype.moveMap = function(newY, newX)
{
   var _loc2_ = 1;
   if(Math.abs(newX - this.loc._x) < 1)
   {
      this.loc._x = newX;
   }
   else
   {
      this.loc._x = this.loc._x - (this.loc._x - newX) * _loc2_;
   }
   if(Math.abs(newY - this.loc._y) < 1)
   {
      this.loc._y = newY;
   }
   else
   {
      this.loc._y = this.loc._y - (this.loc._y - newY) * _loc2_;
   }
};
World.prototype.clearMap = function(map)
{
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      map[_loc3_] = [];
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         map[_loc3_][_loc2_] = null;
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.clearDebugMap = function()
{
   trace("clearDebugMap()");
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         removeMovieClip(this.loc["DEBUG_" + _loc3_ + "_" + _loc2_]);
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.debugMap = function(map)
{
   this.clearDebugMap();
   var _loc8_ = 7000;
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         var _loc4_ = {_x:_loc2_ * this.gridsize,_y:_loc3_ * this.gridsize,txt:map[_loc3_][_loc2_]};
         _loc8_;
         this.loc.attachMovie("debug_mc","DEBUG_" + _loc3_ + "_" + _loc2_,_loc8_++,_loc4_);
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.getLevel = function(num, col, row)
{
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         num = num + 1;
         if(_loc3_ == row && _loc2_ == col)
         {
            return num;
         }
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.getHumanBonus = function(row, col)
{
   return this.map.terrain[row][col].hb_bonus;
};
World.prototype.getTerrain = function(row, col)
{
   return this.map.terrain[row][col].name;
};
World.prototype.showTerrain = function()
{
   if(EDITOR_VERSION)
   {
      var _loc5_ = 0;
      var _loc3_ = 0;
      while(_loc3_ < this.rows)
      {
         var _loc2_ = 0;
         while(_loc2_ < this.cols)
         {
            var _loc4_ = {_x:_loc2_ * this.gridsize,_y:_loc3_ * this.gridsize,txt:_loc5_};
            _loc5_;
            this.loc.attachMovie(this.map.terrain[_loc3_][_loc2_].model,"g_" + _loc3_ + "_" + _loc2_,_loc5_++,_loc4_);
            _loc2_ = _loc2_ + 1;
         }
         _loc3_ = _loc3_ + 1;
      }
   }
   else
   {
      this.loc.attachMovie("empty_mc","bg_map_mc",1);
      loadMovie(DATA_DIR + "maps/" + this.map.bgModel,this.loc.bg_map_mc);
   }
};
World.prototype.buildCityList = function()
{
   var _loc8_ = [];
   for(var _loc9_ in this.map.cities)
   {
      var _loc7_ = this.map.cities[_loc9_][0];
      var _loc2_ = this.map.cities[_loc9_][1];
      var _loc4_ = this.map.cities[_loc9_][2];
      var _loc3_ = this.map.cities[_loc9_][3];
      var _loc6_ = this.map.cities[_loc9_][4];
      var _loc5_ = this.game.getPlayer(_loc2_);
      _loc8_.push(new City(_loc7_,_loc2_,_loc4_,_loc3_,_loc6_,_loc5_));
   }
   return _loc8_;
};
World.prototype.getCity = function(row, col)
{
   var _loc2_ = this.map.cities[row][col];
   if(_loc2_ == null)
   {
      return null;
   }
   return this.cityList[_loc2_];
};
World.prototype.showCities = function()
{
   var _loc9_ = this.Cities_StartLevel;
   this.clearMap(this.map.cities = []);
   var _loc3_ = 0;
   while(_loc3_ < this.cityList.length)
   {
      var _loc2_ = this.cityList[_loc3_];
      var _loc4_ = _loc2_.model;
      var _loc5_ = this.getLevel(_loc9_,_loc2_.col,_loc2_.row);
      this.map.cities[_loc2_.row][_loc2_.col] = _loc3_;
      Object.registerClass(_loc4_,City);
      this.loc.attachMovie(_loc4_,"city_" + _loc2_.row + "_" + _loc2_.col,_loc5_,{_x:_loc2_.col * this.gridsize,_y:_loc2_.row * this.gridsize,id:_loc3_});
      _loc2_.id = _loc3_;
      _loc2_.mc = this.loc["city_" + _loc2_.row + "_" + _loc2_.col];
      _loc2_.mc.obj = _loc2_;
      _loc2_.mc.world = this;
      _loc2_.setPlayer(_loc2_.player);
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.buildUnitList = function()
{
   var _loc10_ = [];
   for(var _loc11_ in this.map.units)
   {
      var _loc9_ = this.map.units[_loc11_][0];
      var _loc3_ = this.map.units[_loc11_][2];
      var _loc7_ = this.map.units[_loc11_][3];
      var _loc2_ = this.map.units[_loc11_][4];
      var _loc4_ = this.map.units[_loc11_][5];
      if(this.map.units[_loc11_].length == 7)
      {
         var _loc5_ = int(this.map.units[_loc11_][6]);
         if(_loc5_ > this.unitIDcounter)
         {
            this.unitIDcounter = _loc5_;
         }
      }
      else
      {
         this.unitIDcounter = this.unitIDcounter + 1;
         _loc5_ = this.unitIDcounter;
      }
      var _loc6_ = this.game.getPlayer(_loc2_);
      var _loc8_ = this;
      _loc10_.push(new Unit(_loc5_,_loc9_,_loc3_,_loc7_,_loc2_,_loc4_,_loc6_,_loc8_));
   }
   return _loc10_;
};
World.prototype.showUnits = function()
{
   var _loc3_ = this.Units_StartLevel;
   this.clearMap(this.map.units = []);
   var _loc2_ = 0;
   while(_loc2_ < this.unitList.length)
   {
      this.unitList[_loc2_].displayMC();
      _loc2_ = _loc2_ + 1;
   }
};
World.prototype.PlayerAreEnemies = function(player1, player2)
{
   if(player1 != player2)
   {
      return true;
   }
   return false;
};
World.prototype.PlayerAreFriends = function(player1, player2)
{
   if(player1 == player2)
   {
      return true;
   }
   return false;
};
World.prototype.build = function()
{
   this.showTerrain();
   this.showCities();
   this.showUnits();
};
World.prototype.CitiesCanProduceUnit = function(player, unit_category)
{
   for(i in this.cityList)
   {
      var _loc4_ = this.cityList[i];
      if(_loc4_.getPlayer() == player)
      {
         for(i in _root.UnitDataObjects)
         {
            var _loc3_ = _root.UnitDataObjects[i];
            if((_loc3_.type == unit_category || _loc3_.name == unit_category) && _loc3_.prodBuilding == _loc4_.type)
            {
               return true;
            }
         }
      }
   }
   return false;
};
World.prototype.CitiesCanSupplyUnit = function(city, item)
{
   if(city.player != item.player)
   {
      return false;
   }
   var _loc1_ = item.getTypeCat();
   return city.checkSupplyCapabilities(_loc1_);
};
World.prototype.CitiesCountNeutral = function(player, city_category)
{
   var _loc3_ = 0;
   for(i in this.cityList)
   {
      var _loc2_ = this.cityList[i];
      if(_loc2_.getPlayer() == null && _loc2_.type == city_category)
      {
         _loc3_ = _loc3_ + 1;
      }
   }
   return _loc3_;
};
World.prototype.CitiesCountOccupied = function(player, city_category)
{
   var _loc3_ = 0;
   var _loc4_ = this.game.getEnemyPlayer(player);
   for(i in this.cityList)
   {
      var _loc2_ = this.cityList[i];
      if(_loc2_.getPlayer() == _loc4_ && _loc2_.type == city_category)
      {
         _loc3_ = _loc3_ + 1;
      }
   }
   return _loc3_;
};
World.prototype.CitiesIsProductionFacility = function(city)
{
   for(i in _root.UnitDataObjects)
   {
      var _loc2_ = _root.UnitDataObjects[i];
      if(_loc2_.prodBuilding == city.type)
      {
         return true;
      }
   }
};
World.prototype.CitiesGetProfile = function(city)
{
   return _root[city.type];
};
World.prototype.DataCitiesGetScore = function(profile)
{
   return profile.aiScore;
};
World.prototype.UnitsCountAll = function(player)
{
   var _loc3_ = 0;
   for(i in this.unitList)
   {
      var _loc2_ = this.unitList[i];
      if(_loc2_.getPlayer() == player)
      {
         _loc3_ = _loc3_ + 1;
      }
   }
   return _loc3_;
};
World.prototype.UnitsCount = function(player, unit_category)
{
   var _loc4_ = 0;
   for(i in this.unitList)
   {
      var _loc2_ = this.unitList[i];
      var _loc3_ = this.UnitsGetProfile(_loc2_);
      if(_loc2_.getPlayer() == player && _loc3_.type == unit_category)
      {
         _loc4_ = _loc4_ + 1;
      }
   }
   return _loc4_;
};
World.prototype.UnitsCountEnemyHitpoints = function(player, unit_category)
{
   var _loc4_ = 0;
   var _loc5_ = this.game.getEnemyPlayer(player);
   for(i in this.unitList)
   {
      var _loc2_ = this.unitList[i];
      if(unit_category != undefined)
      {
         var _loc3_ = this.UnitsGetProfile(_loc2_);
         if(_loc2_.getPlayer() == _loc5_ && _loc3_.type == unit_category)
         {
            _loc4_ = _loc4_ + _loc2_.getHP();
         }
      }
      else if(_loc2_.getPlayer() == _loc5_)
      {
         _loc4_ = _loc4_ + _loc2_.getHP();
      }
   }
   return _loc4_;
};
World.prototype.UnitsCountFriendlyHitpoints = function(player)
{
   var _loc3_ = 0;
   for(i in this.unitList)
   {
      var _loc2_ = this.unitList[i];
      if(_loc2_.getPlayer() == player)
      {
         _loc3_ = _loc3_ + _loc2_.getHP();
      }
   }
   return _loc3_;
};
World.prototype.UnitsCountCounterHitpoints = function(player, unit_category)
{
   var _loc4_ = 0;
   for(i in this.unitList)
   {
      var _loc2_ = this.unitList[i];
      var _loc3_ = this.UnitsGetProfile(_loc2_);
      if(_loc2_.getPlayer() == player && _loc3_.type == unit_category)
      {
         _loc4_ = _loc4_ + _loc2_.getHP();
      }
   }
   return _loc4_;
};
World.prototype.UnitsGetProfile = function(unit)
{
   return _root[unit.type];
};
World.prototype.UnitsGetNumberOfFights = function(enemy, item, FightCategory)
{
   var _loc2_ = item.getTypeCat();
   var _loc1_ = enemy.getNumberOfFights(_loc2_,FightCategory);
   return _loc1_;
};
World.prototype.DataUnitsIsValid = function(profile)
{
   if(profile)
   {
      return true;
   }
   return false;
};
World.prototype.DataUnitsGetPrice = function(profile)
{
   return profile.price;
};
World.prototype.DataUnitsGetQuality = function(profile)
{
   return profile.quality;
};
World.prototype.DataUnitsGetAttackStrengthAgainstCategory = function(profile, category)
{
   return profile.NumberOfFights[category][0];
};
World.prototype.DataUnitsGetProduction = function(profile)
{
   var _loc2_ = profile.prodBuilding;
   return _root[_loc2_];
};
World.prototype.DataUnitsGetCategory = function(profile)
{
   return profile.type;
};
World.prototype.DataUnitsCanCaptureCity = function(profile)
{
   if(profile.type == "Human")
   {
      return true;
   }
   return false;
};
World.prototype.DataUnitsGetBehaviour = function(profile)
{
   return profile.behaviour;
};
World.prototype.DataUnitsGetMinRange = function(profile)
{
   return profile.minRange;
};
World.prototype.DataUnitsGetRange = function(profile)
{
   return profile.range;
};
World.prototype.DataUnitsIsFlying = function(profile)
{
   if(profile.type == "Air")
   {
      return true;
   }
   return false;
};
World.prototype.buildMovementMap = function()
{
   this.map.movement = [];
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      this.map.movement[_loc3_] = [];
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         this.map.movement[_loc3_][_loc2_] = 0;
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.clearMovementMap = function()
{
   delete this.map.movement;
   this.clearMovement();
   this.buildMovementMap();
};
World.prototype.setMovement = function(row, col, movement)
{
   this.map.movement[row][col] = movement;
};
World.prototype.clearMovement = function()
{
   var _loc4_ = 0;
   while(_loc4_ < this.rows)
   {
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         var _loc3_ = this.loc["p_" + _loc4_ + "_" + _loc2_];
         if(_loc3_)
         {
            removeMovieClip(_loc3_);
         }
         _loc2_ = _loc2_ + 1;
      }
      _loc4_ = _loc4_ + 1;
   }
};
World.prototype.showMovement = function(unit)
{
   this.clearMovement();
   var _loc11_ = this.Movement_StartLevel;
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         if(this.map.movement[_loc3_][_loc2_] > 0 && this.map.units[_loc3_][_loc2_] == null)
         {
            var _loc4_ = {row:_loc3_,col:_loc2_,_y:_loc3_ * this.gridsize,_x:_loc2_ * this.gridsize,world:this,unit:unit};
            _loc11_;
            this.loc.attachMovie("path_mc","p_" + _loc3_ + "_" + _loc2_,_loc11_++,_loc4_);
            this.loc["p_" + _loc3_ + "_" + _loc2_].onPress = function()
            {
               this.world.destroyBattle();
               this.unit.move(this.row,this.col);
            };
         }
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.selectNeighbours = function(neighbour, row, col)
{
   var _loc3_ = row;
   var _loc2_ = col;
   switch(neighbour)
   {
      case 1:
         _loc3_ = _loc3_ - 1;
         break;
      case 2:
         _loc2_ = _loc2_ + 1;
         break;
      case 3:
         _loc3_ = _loc3_ + 1;
         break;
      case 4:
         _loc2_ = _loc2_ - 1;
   }
   this.Neighbour = {row:_loc3_,col:_loc2_};
   return true;
};
World.prototype.NeighboursSelect = function(neighbour, row, col)
{
   var _loc3_ = row;
   var _loc2_ = col;
   switch(neighbour)
   {
      case 0:
         _loc3_ = _loc3_ - 1;
         break;
      case 1:
         _loc2_ = _loc2_ + 1;
         break;
      case 2:
         _loc3_ = _loc3_ + 1;
         break;
      case 3:
         _loc2_ = _loc2_ - 1;
   }
   var _loc4_ = {row:_loc3_,col:_loc2_};
   if(_loc3_ >= 0 && _loc3_ <= this.rows && _loc2_ >= 0 && _loc2_ <= this.cols)
   {
      return _loc4_;
   }
   return null;
};
World.prototype.createMovement = function(unit, enemyUnitsAreBlocking)
{
   if(unit.state == unit.State_Finished && enemyUnitsAreBlocking)
   {
      trace("unit already finished with moving and fighting");
      this.clearMovementMap();
      return undefined;
   }
   if(unit.state == unit.State_FinishedMoving && enemyUnitsAreBlocking)
   {
      trace("unit already finished with moving");
      this.clearMovementMap();
      return undefined;
   }
   this.BlockedField = -1;
   var _loc4_ = unit.getMovement();
   this.clearMovementMap();
   this.Path = [];
   this.setMovement(unit.row,unit.col,_loc4_ + 1);
   var _loc2_ = 1;
   while(_loc2_ <= 4)
   {
      if(this.selectNeighbours(_loc2_,unit.row,unit.col))
      {
         this.expandMovement(_loc4_,this.Neighbour.row,this.Neighbour.col,unit,enemyUnitsAreBlocking);
      }
      _loc2_ = _loc2_ + 1;
   }
   if(this.game.currPlayer.PLAYER_TYPE == TYPE_HUMAN)
   {
      this.showMovement(unit);
   }
   else
   {
      this.clearMovement();
   }
};
World.prototype.expandMovement = function(movement, row, col, unit, enemyUnitsAreBlocking)
{
   if(row < 0 || col < 0 || row >= this.rows || col >= this.cols)
   {
      return undefined;
   }
   if(enemyUnitsAreBlocking)
   {
      var _loc9_ = this.map.units[row][col];
      var _loc10_ = unit.getPlayer();
      var _loc11_ = _loc9_.getPlayer();
      if(_loc9_ != null)
      {
         if(_loc10_.areEnemy(_loc9_))
         {
            return undefined;
         }
      }
   }
   var _loc8_ = 1;
   if(this.map.cities[row][col] == null || unit.getTypeCat() == "Water")
   {
      _loc8_ = unit.getMovementCost(this.map.terrain[row][col].getName());
      if(_loc8_ == this.BlockedField)
      {
         return undefined;
      }
   }
   else if(this.map.cities[row][col].getName() == "Harbour")
   {
      _loc8_ = movement;
   }
   movement = movement - _loc8_;
   if(movement < 0)
   {
      return undefined;
   }
   if(this.map.movement[row][col] > movement)
   {
      return undefined;
   }
   this.setMovement(row,col,movement + 1);
   if(movement > 0)
   {
      var _loc2_ = 1;
      while(_loc2_ <= 4)
      {
         if(this.selectNeighbours(_loc2_,row,col))
         {
            this.expandMovement(movement,this.Neighbour.row,this.Neighbour.col,unit,enemyUnitsAreBlocking);
         }
         _loc2_ = _loc2_ + 1;
      }
   }
};
World.prototype.pathing = function(row, col, unit)
{
   trace("pathing() row: " + row + " col: " + col + " mc: " + unit.mc);
   if(row == unit.row && col == unit.col)
   {
      this.clearMovementMap();
      return undefined;
   }
   var _loc6_ = this.map.movement[row][col];
   var _loc2_ = 1;
   while(_loc2_ <= 4)
   {
      if(this.selectNeighbours(_loc2_,row,col))
      {
         var _loc3_ = this.map.movement[this.Neighbour.row][this.Neighbour.col];
         if(_loc3_ > _loc6_)
         {
            _loc6_ = _loc3_;
            moveRow = this.Neighbour.row - row;
            moveCol = this.Neighbour.col - col;
         }
      }
      _loc2_ = _loc2_ + 1;
   }
   if(moveRow != 0 || moveCol != 0)
   {
      this.setMovement(row,col,-1);
      this.Path.push([row,col]);
      row = row + moveRow;
      col = col + moveCol;
      this.pathing(row,col,unit);
   }
   return undefined;
};
World.prototype.IsPositionBlocked = function(row, col, profile)
{
   var _loc2_ = this.map.terrain[row][col].getName();
   if(profile.moveCosts[_loc2_] == -1)
   {
      return true;
   }
   return false;
};
World.prototype.createBattle = function(unit)
{
   trace("createBattle( " + unit.type + " )");
   var _loc6_ = null;
   if(unit.state == unit.State_Finished)
   {
      trace("unit already finished with moving and fighting");
      return undefined;
   }
   this.destroyBattle();
   var _loc5_ = unit.getRange();
   var _loc8_ = unit.getMinRange();
   var _loc7_ = unit.getPlayer();
   for(var _loc9_ in this.unitList)
   {
      var _loc2_ = this.unitList[_loc9_];
      if(_loc7_.areEnemy(_loc2_))
      {
         var _loc3_ = unit.computeDistance(_loc2_);
         if(_loc3_ <= _loc5_ && _loc3_ >= _loc8_)
         {
            trace("-\nEnemy in attack range: " + _loc2_.getType());
            trace("unit.getNumberOfFights( " + _loc2_.getTypeCat() + " ): " + unit.getNumberOfFights(_loc2_.getTypeCat(),0));
            if(unit.getNumberOfFights(_loc2_.getTypeCat(),0) > 0)
            {
               trace("can attack unit!");
               this.setBattleMap(_loc2_.row,_loc2_.col,_loc5_);
               this.BattleDescription.push([_loc2_.row,_loc2_.col,_loc2_]);
               _loc6_ = _loc2_;
            }
         }
      }
   }
   return _loc6_;
};
World.prototype.displayBattleFromList = function(attacker, defender, attackerDamage, defenderDamage)
{
   trace("displayBattleFromList( " + attacker.type + " vs. " + defender.type + " )");
   var _loc4_ = attacker.getInitiative();
   var _loc5_ = defender.getInitiative();
   if(attacker.computeDistance(defender) > 1)
   {
      attacker.reduceAmmo(1);
      defender.getHurt(attackerDamage);
      _loc4_ = 0;
      _loc5_ = 1;
   }
   else
   {
      if(defender.getSpecialTerrainBonus())
      {
         _loc5_ = _loc5_ - 1;
      }
      _loc4_ = _loc4_ - 1;
      if(_loc4_ == _loc5_)
      {
         attacker.reduceAmmo(1);
         defender.reduceAmmo(1);
         defender.getHurt(attackerDamage);
         attacker.getHurt(defenderDamage);
      }
      else if(_loc4_ < _loc5_)
      {
         attacker.reduceAmmo(1);
         defender.getHurt(attackerDamage);
         if(defender)
         {
            defender.reduceAmmo(1);
            attacker.getHurt(defenderDamage);
         }
      }
      else if(_loc4_ > _loc5_)
      {
         defender.reduceAmmo(1);
         attacker.getHurt(defenderDamage);
         if(attacker)
         {
            attacker.reduceAmmo(1);
            defender.getHurt(attackerDamage);
         }
      }
   }
   if(BATTLEWINDOW)
   {
      this.showBattleWindow(attacker,defender,attackerDamage,defenderDamage);
   }
   this.playFightSound(attacker.getType(),defender.getType());
   if(attacker != undefined)
   {
      attacker.state = attacker.State_Finished;
   }
   attacker.showHitPoints();
   if(this.game.currPlayer.PLAYER_TYPE != TYPE_COMPUTER)
   {
      this.game.SBshowUnitInfo(attacker);
   }
};
World.prototype.executeBattle = function(attacker, defender)
{
   trace("-\nexecuteBattle( " + attacker.type + " vs. " + defender.type + " )");
   this.game.disableUserControl();
   this.clearMovementMap();
   this.buildBattleMap();
   var _loc5_ = 0;
   var _loc6_ = 0;
   var _loc9_ = attacker.row;
   var _loc11_ = attacker.col;
   var _loc12_ = defender.row;
   var _loc10_ = defender.col;
   var _loc7_ = attacker.getInitiative();
   var _loc8_ = defender.getInitiative();
   if(attacker.computeDistance(defender) > 1)
   {
      trace("is distance attack");
      _loc5_ = this.computeDamage(attacker,defender);
      attacker.reduceAmmo(1);
      defender.getHurt(_loc5_);
      _loc7_ = 0;
      _loc8_ = 1;
   }
   else
   {
      trace("is close combat");
      if(defender.getSpecialTerrainBonus())
      {
         _loc8_ = _loc8_ - 1;
      }
      _loc7_ = _loc7_ - 1;
      if(_loc7_ == _loc8_)
      {
         _loc5_ = this.computeDamage(attacker,defender);
         _loc6_ = this.computeDamage(defender,attacker);
         attacker.reduceAmmo(1);
         defender.reduceAmmo(1);
         defender.getHurt(_loc5_);
         attacker.getHurt(_loc6_);
      }
      else if(_loc7_ < _loc8_)
      {
         _loc5_ = this.computeDamage(attacker,defender);
         attacker.reduceAmmo(1);
         defender.getHurt(_loc5_);
         if(defender)
         {
            _loc6_ = this.computeDamage(defender,attacker);
            defender.reduceAmmo(1);
            attacker.getHurt(_loc6_);
         }
      }
      else if(_loc7_ > _loc8_)
      {
         _loc6_ = this.computeDamage(defender,attacker);
         defender.reduceAmmo(1);
         attacker.getHurt(_loc6_);
         if(attacker)
         {
            _loc5_ = this.computeDamage(attacker,defender);
            attacker.reduceAmmo(1);
            defender.getHurt(_loc5_);
         }
      }
   }
   if(BATTLEWINDOW)
   {
      this.showBattleWindow(attacker,defender,_loc5_,_loc6_);
   }
   this.playFightSound(attacker.getType(),defender.getType());
   if(attacker != undefined)
   {
      attacker.state = attacker.State_Finished;
   }
   attacker.showHitPoints();
   if(!_root.showActionList && this.game.currPlayer.PLAYER_TYPE != TYPE_COMPUTER)
   {
      this.game.SBshowUnitInfo(attacker);
      _root.ActionList.push(_root.ACTION_FIGHT + "x" + attacker.unitID + "*" + defender.unitID + "*" + Math.round(_loc5_) + "-" + Math.round(_loc6_));
   }
};
World.prototype.computeDamage = function(attacker, defender)
{
   var _loc12_ = 0;
   loop = 0;
   while(loop < this.Battle_LuckValue)
   {
      var _loc2_ = 0;
      var _loc10_ = 0;
      var _loc8_ = attacker.getNumberOfFights(defender.getTypeCat(),0);
      var _loc7_ = defender.getNumberOfFights(attacker.getTypeCat(),1);
      if(defender.computeDistance(attacker) < attacker.getMinRange())
      {
         _loc8_ = 0;
      }
      if(attacker.computeDistance(defender) < defender.getMinRange())
      {
         _loc7_ = 0;
      }
      var _loc9_ = this.getCity(defender.row,defender.col);
      if(_loc9_ != null)
      {
         _loc7_ = _loc7_ + _loc9_.getBattleBonus();
         _loc7_ = _loc7_ + this.getHumanBonus(defender.row,defender.col);
      }
      _loc9_ = this.getCity(attacker.row,attacker.col);
      if(_loc9_ != null)
      {
         _loc8_ = _loc8_ + _loc9_.getBattleBonus() / 2;
         _loc8_ = _loc8_ + this.getHumanBonus(attacker.row,attacker.col) / 2;
      }
      var _loc11_ = attacker.hitPoints;
      units = 0;
      while(units < _loc11_)
      {
         var _loc3_ = 0;
         var _loc4_ = 0;
         attacks = 0;
         while(attacks < _loc8_)
         {
            _loc2_ = this.getDice();
            if(_loc2_ > _loc3_)
            {
               _loc3_ = _loc2_;
            }
            attacks++;
         }
         defends = 0;
         while(defends < _loc7_)
         {
            _loc2_ = this.getDice();
            if(_loc2_ > _loc4_)
            {
               _loc4_ = _loc2_;
            }
            defends++;
         }
         if(_loc4_ < _loc3_)
         {
            _loc10_ = _loc10_ + 1;
         }
         units++;
      }
      _loc12_ = _loc12_ + _loc10_;
      loop++;
   }
   _loc12_ = _loc12_ / this.Battle_LuckValue;
   if(_loc12_ > defender.getHP())
   {
      _loc12_ = defender.getHP();
   }
   if(_loc12_ > 8)
   {
      _loc12_ = 8;
   }
   return _loc12_;
};
World.prototype.clearBattles = function()
{
   for(var _loc3_ in this.BattleDescription)
   {
      var _loc2_ = this.loc["battle_" + _loc3_];
      if(_loc2_)
      {
         removeMovieClip(_loc2_);
      }
   }
};
World.prototype.showBattles = function(unit)
{
   this.clearBattles();
   var _loc11_ = this.Battle_StartLevel;
   for(var _loc12_ in this.BattleDescription)
   {
      var _loc3_ = this.BattleDescription[_loc12_][0];
      var _loc5_ = this.BattleDescription[_loc12_][1];
      var _loc4_ = this.BattleDescription[_loc12_][2];
      var _loc2_ = {row:_loc3_,col:_loc5_,_y:_loc3_ * this.gridsize,_x:_loc5_ * this.gridsize,world:this,defender:_loc4_,attacker:unit};
      _loc11_;
      this.loc.attachMovie("battle_mc","battle_" + _loc12_,_loc11_++,_loc2_);
      this.loc["battle_" + _loc12_].onPress = function()
      {
         this.world.executeBattle(this.attacker,this.defender);
         this.world.clearBattles();
      };
   }
};
World.prototype.setBattleMap = function(row, col, range)
{
   this.map.battle[row][col] = range;
};
World.prototype.buildBattleMap = function()
{
   this.map.battle = [];
   var _loc3_ = 0;
   while(_loc3_ < this.rows)
   {
      this.map.battle[_loc3_] = [];
      var _loc2_ = 0;
      while(_loc2_ < this.cols)
      {
         this.map.battle[_loc3_][_loc2_] = 0;
         _loc2_ = _loc2_ + 1;
      }
      _loc3_ = _loc3_ + 1;
   }
};
World.prototype.destroyBattle = function()
{
   this.clearBattles();
   this.buildBattleMap();
   this.BattleDescription = [];
};
World.prototype.getDice = function()
{
   return Math.floor(Math.random() * 6 + 1);
};
World.prototype.exitBattleWindow = function(Game)
{
   trace("exitBattleWindow!");
   if(!_root.showActionList && Game.currPlayer.PLAYER_TYPE != TYPE_COMPUTER)
   {
      trace("exitBattleWindow() enableUserControl");
      Game.enableUserControl();
   }
   _root.battlewindow_mc._visible = false;
   clearInterval(_root.BattleINT);
};
World.prototype.showBattleWindow = function(attacker, defender, attackerDamage, defenderDamage)
{
   trace("showBattleWindow" + this.game);
   var _loc7_ = attacker.getType();
   var _loc13_ = attacker.getOwner().substr(1,2);
   var _loc9_ = this.map.terrain[attacker.row][attacker.col].getName();
   var _loc10_ = this.map.cities[attacker.row][attacker.col];
   var _loc15_ = "bw_" + _loc7_ + "_" + _loc13_;
   var _loc5_ = "bw_" + _loc9_;
   if(_loc7_ == "FlyingUnit")
   {
      _loc5_ = "bw_sky";
   }
   else if(_loc10_ != null)
   {
      if(this.cityList[_loc10_].getType() == "Harbour")
      {
         if(_loc7_ == "Ship")
         {
            _loc5_ = "bw_harbour_ship";
         }
         else
         {
            _loc5_ = "bw_harbour_unit";
         }
      }
      else
      {
         _loc5_ = "bw_city";
      }
   }
   var _loc8_ = defender.getType();
   var _loc17_ = defender.getOwner().substr(1,2);
   var _loc12_ = this.map.terrain[defender.row][defender.col].getName();
   var _loc11_ = this.map.cities[defender.row][defender.col];
   var _loc18_ = "bw_" + _loc8_ + "_" + _loc17_;
   var _loc3_ = "bw_" + _loc12_;
   if(_loc8_ == "FlyingUnit")
   {
      _loc3_ = "bw_sky";
   }
   else if(_loc11_ != null)
   {
      if(this.cityList[_loc11_].getType() == "Harbour")
      {
         if(_loc8_ == "Ship")
         {
            _loc3_ = "bw_harbour_ship";
         }
         else
         {
            _loc3_ = "bw_harbour_unit";
         }
      }
      else
      {
         _loc3_ = "bw_city";
      }
   }
   trace("aType:" + _loc7_ + " dType:" + _loc8_ + " aTer:" + _loc9_ + " dTer:" + _loc12_);
   _root.battlewindow_mc._visible = true;
   _root.battlewindow_mc.attack_hp = attacker.getHP() + Math.round(defenderDamage);
   _root.battlewindow_mc.defend_hp = defender.getHP() + Math.round(attackerDamage);
   _root.battlewindow_mc.attackerDamage = Math.round(attackerDamage);
   _root.battlewindow_mc.defenderDamage = Math.round(defenderDamage);
   _root.battlewindow_mc.attacker_mc.unit_mc.attachMovie(_loc15_,"unit",1);
   _root.battlewindow_mc.attacker_mc.terrain_mc.attachMovie(_loc5_,"terrain",1);
   _root.battlewindow_mc.defender_mc.unit_mc.attachMovie(_loc18_,"unit",1);
   _root.battlewindow_mc.defender_mc.terrain_mc.attachMovie(_loc3_,"terrain",1);
   _root.HPreduceINT = setInterval(this.BWshowReduceHP,250,defenderDamage,attackerDamage);
   _root.BattleINT = setInterval(this.exitBattleWindow,3500,this.game);
};
World.prototype.BWshowReduceHP = function()
{
   var _loc2_ = false;
   var _loc3_ = false;
   if(_root.battlewindow_mc.defenderDamage > 0)
   {
      _root.battlewindow_mc.attack_hp = _root.battlewindow_mc.attack_hp - 1;
      if(_root.battlewindow_mc.attack_hp == 0)
      {
         removeMovieClip(_root.battlewindow_mc.attacker_mc.unit_mc.unit);
      }
      _root.battlewindow_mc.defenderDamage = _root.battlewindow_mc.defenderDamage - 1;
   }
   else
   {
      _loc2_ = true;
   }
   if(_root.battlewindow_mc.attackerDamage > 0)
   {
      _root.battlewindow_mc.defend_hp = _root.battlewindow_mc.defend_hp - 1;
      if(_root.battlewindow_mc.defend_hp == 0)
      {
         removeMovieClip(_root.battlewindow_mc.defender_mc.unit_mc.unit);
      }
      _root.battlewindow_mc.attackerDamage = _root.battlewindow_mc.attackerDamage - 1;
   }
   else
   {
      _loc3_ = true;
   }
   if(_loc2_ && _loc3_)
   {
      clearInterval(_root.HPreduceINT);
   }
};
World.prototype.playFightSound = function(attackerType, defenderType)
{
   if(SOUNDFX)
   {
      var _loc5_ = false;
      var _loc1_ = false;
      var _loc4_ = false;
      var _loc2_ = false;
      var _loc7_ = false;
      var _loc3_ = false;
      var _loc6_ = false;
      switch(attackerType)
      {
         case "Guard":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            _loc2_ = true;
            break;
         case "Archer":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            _loc1_ = true;
            break;
         case "Swordsman":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            _loc2_ = true;
            break;
         case "Spearman":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            _loc2_ = true;
            break;
         case "Catapult":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            _loc3_ = true;
            break;
         case "Trebuchet":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_heavy",100,0);
            _loc7_ = true;
            break;
         case "Ballista":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            _loc3_ = true;
            break;
         case "SiegeTower":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            _loc1_ = true;
            _loc3_ = true;
            break;
         case "BowCavalry":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            _loc1_ = true;
            _loc4_ = true;
            break;
         case "LightCavalry":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            _loc4_ = true;
            break;
         case "HeavyCavalry":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            _loc4_ = true;
            break;
         case "Ship":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_ships",100,0);
            _loc6_ = true;
            break;
         case "FlyingUnit":
            _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_air",100,0);
            _loc5_ = true;
      }
      switch(defenderType)
      {
         case "Guard":
            if(!_loc2_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            }
            break;
         case "Archer":
            if(!_loc1_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            }
            break;
         case "Swordsman":
            if(!_loc2_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            }
            break;
         case "Spearman":
            if(!_loc2_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_human",100,0);
            }
            break;
         case "Catapult":
            if(!_loc3_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            }
            break;
         case "Trebuchet":
            if(!_loc7_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_heavy",100,0);
            }
            break;
         case "Ballista":
            if(!_loc3_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            }
            break;
         case "SiegeTower":
            if(!_loc1_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            }
            if(!_loc3_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_machines_light",100,0);
            }
            break;
         case "BowCavalry":
            if(!_loc1_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_bow",100,0);
            }
            if(!_loc4_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            }
            break;
         case "LightCavalry":
            if(!_loc4_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            }
            break;
         case "HeavyCavalry":
            if(!_loc4_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_horses",100,0);
            }
            break;
         case "Ship":
            if(!_loc6_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_ships",100,0);
            }
            break;
         case "FlyingUnit":
            if(!_loc5_)
            {
               _level9000.initSound("SoundFX_mc","SoundFX_obj",9001,"fight_air",100,0);
            }
      }
   }
};
World.prototype.noMoreUnitLeft = function(player)
{
   trace("noMoreUnitLeft?");
   var _loc3_ = true;
   for(var _loc5_ in this.unitList)
   {
      var _loc2_ = this.unitList[_loc5_];
      if(_loc2_.player == player)
      {
         _loc3_ = false;
      }
   }
   return _loc3_;
};
Player = function(id, funds, type, name, PLAYER_TYPE)
{
   this.id = id;
   this.funds = funds;
   this.type = type;
   this.name = name;
   this.PLAYER_TYPE = PLAYER_TYPE;
};
Player.prototype.getType = function()
{
   return this.type;
};
Player.prototype.getEnemyType = function()
{
   if(this.type == "crusader")
   {
      return "sarazen";
   }
   if(this.type == "sarazen")
   {
      return "crusader";
   }
   trace("getEnemyType ERROR!!!");
};
Player.prototype.getGold = function()
{
   return this.funds;
};
Player.prototype.payUnit = function(price)
{
   this.funds = this.funds - price;
};
Player.prototype.buyUnit = function(type, row, col, IsUnitID)
{
   var _loc5_ = this.world.UnitsCountAll(this);
   if(_loc5_ >= MAX_UNITS)
   {
      trace("UnitCounter >= MAX_UNITS: " + _loc5_);
      if(this.PLAYER_TYPE != TYPE_COMPUTER)
      {
         this.world.game.promtMessageWindow(_root.LanguageObj.ID_76);
      }
      return undefined;
   }
   var _loc4_ = _root[type].price;
   var _loc11_ = this.getGold();
   if(_loc11_ < _loc4_)
   {
      return undefined;
   }
   this.payUnit(_loc4_);
   var _loc6_ = this.type;
   var _loc7_ = _root[type].hitPoints;
   if(IsUnitID != undefined)
   {
      var _loc8_ = IsUnitID;
      if(_loc8_ >= this.world.unitIDcounter)
      {
         this.world.unitIDcounter = _loc8_ + 1;
      }
   }
   else
   {
      this.world.unitIDcounter = this.world.unitIDcounter + 1;
      _loc8_ = this.world.unitIDcounter;
   }
   var _loc3_ = new Unit(_loc8_,type,row,col,_loc6_,_loc7_,this,this.world);
   this.world.unitList.push(_loc3_);
   _loc3_.displayMC();
   _loc3_.state = _loc3_.State_Finished;
   _loc3_.showHitPoints();
   _loc3_.mc.onPress = function()
   {
      this.world.game.SBshowUnitInfo(this.unit);
   };
   if(!_root.showActionList && this.PLAYER_TYPE != TYPE_COMPUTER)
   {
      this.world.game.SBshowUnitInfo(_loc3_);
      var _loc9_ = this.world.map.cities[row][col];
      _root.ActionList.push(_root.ACTION_BUY + "x" + _loc9_ + "*" + _loc3_.unitID + "*" + _loc3_.getTypeID());
   }
};
Player.prototype.areEnemy = function(target)
{
   var _loc3_ = target.getPlayer();
   if(this == target.getPlayer())
   {
      return false;
   }
   return true;
};
Marker = function(model, name, world)
{
   this.model = model;
   this.name = name;
   this.world = world;
};
Marker.prototype = new MovieClip();
Marker.prototype.setPos = function(row, col)
{
   this.mc.newX = col * this.world.gridsize;
   this.mc.newY = row * this.world.gridsize;
};
Marker.prototype.setPosINT = function(row, col, game)
{
   clearInterval(_root.MarkerINT);
   game.Marker.mc.newX = col * game.world.gridsize;
   game.Marker.mc.newY = row * game.world.gridsize;
};
Marker.prototype.init = function(row, col)
{
   this.row = row;
   this.col = col;
   this.world.loc.attachMovie(this.model,this.name,9999,{_x:col * this.world.gridsize,_y:row * this.world.gridsize});
   this.mc = this.world.loc[this.name];
   this.mc.mc = this.mc;
   this.mc.world = this.world;
   this.mc.maxX = this.world.cols * this.world.gridsize - this.world.gridsize;
   this.mc.maxY = this.world.rows * this.world.gridsize - this.world.gridsize;
   this.mc.step = 5;
   this.mc.newX = 0;
   this.mc.newY = 0;
   this.mc.newMapX = this.world.loc._x;
   this.mc.newMapY = this.world.loc._y;
   this.mc.maxMapX = - this.world.gridsize * this.world.cols - this.world.mask._width - this.world.mask._x;
   this.mc.maxMapY = - this.world.gridsize * this.world.rows - this.world.mask._height - this.world.mask._y;
   var mouseOver = false;
   this.mc.onEnterFrame = function()
   {
      var _loc4_ = _root._xmouse;
      var _loc3_ = _root._ymouse;
      mouseOver = _loc3_ > this.world.mask._y && _loc3_ < this.world.mask._height && _loc4_ > this.world.mask._x && _loc4_ < this.world.mask._width;
      if(mouseOver && USER_CONTROL)
      {
         this.newY = Math.floor(this._parent._ymouse / this.world.gridsize) * this.world.gridsize;
         this.newX = Math.floor(this._parent._xmouse / this.world.gridsize) * this.world.gridsize;
         if(this.newX < 0)
         {
            this.newX = 0;
         }
         if(this.newX > this.maxX)
         {
            this.newX = this.maxX;
         }
         if(this.newY < 0)
         {
            this.newY = 0;
         }
         if(this.newY > this.maxY)
         {
            this.newY = this.maxY;
         }
      }
      myPoint = new Object();
      myPoint.x = this._x - 10;
      myPoint.y = this._y - 10;
      this._parent.localToGlobal(myPoint);
      if(myPoint.x > this.world.mask._width - this.world.gridsize * 3)
      {
         if(this.newMapX - this.step > this.maxMapX)
         {
            this.newMapX = this.newMapX - this.step;
         }
         else
         {
            this.newMapX = this.maxMapX;
         }
      }
      else if(myPoint.x < this.world.mask._x + this.world.gridsize * 2)
      {
         if(this.newMapX + this.step < this.world.mask._x)
         {
            this.newMapX = this.newMapX + this.step;
         }
         else
         {
            this.newMapX = this.world.mask._x;
         }
      }
      if(myPoint.y > this.world.mask._height - this.world.gridsize * 2)
      {
         if(this.newMapY - this.step > this.maxMapY)
         {
            this.newMapY = this.newMapY - this.step;
         }
         else
         {
            this.newMapY = this.maxMapY;
         }
      }
      else if(myPoint.y < this.world.mask._y + this.world.gridsize * 3)
      {
         if(this.newMapY + this.step < this.world.mask._y)
         {
            this.newMapY = this.newMapY + this.step;
         }
         else
         {
            this.newMapY = this.world.mask._y;
         }
      }
      if(this.world.loc._y != this.newMapY || this.world.loc._x != this.newMapX)
      {
         this.world.moveMap(this.newMapY,this.newMapX);
      }
      if(this._y != this.newY || this._x != this.newX)
      {
         this.move(this.newY,this.newX);
         output = false;
      }
      else if(!output)
      {
         col = this._x / this.world.gridsize;
         row = this._y / this.world.gridsize;
         this.world.game.SBshowRollOverInfo(row,col);
         output = true;
      }
   };
};
Marker.prototype.move = function(newY, newX)
{
   this.mc._x = newX;
   this.mc._y = newY;
};
Terrain = function(name, model, defence, hb_bonus)
{
   this.name = name;
   this.model = model;
   this.defence = defence;
   this.hb_bonus = hb_bonus;
};
Terrain.prototype.getNameLang = function()
{
   var _loc3_ = null;
   switch(this.name)
   {
      case "ground":
         _loc3_ = _root.LanguageObj.ID_47;
         break;
      case "street":
         _loc3_ = _root.LanguageObj.ID_49;
         break;
      case "wood":
         _loc3_ = _root.LanguageObj.ID_50;
         break;
      case "hill":
         _loc3_ = _root.LanguageObj.ID_51;
         break;
      case "river":
         _loc3_ = _root.LanguageObj.ID_52;
         break;
      case "sea":
         _loc3_ = _root.LanguageObj.ID_53;
         break;
      case "hedgerows":
         _loc3_ = _root.LanguageObj.ID_55;
         break;
      case "swamp":
         _loc3_ = _root.LanguageObj.ID_57;
   }
   return _loc3_;
};
Terrain.prototype.getName = function()
{
   return this.name;
};
Terrain.prototype.getDefence = function()
{
   return this.defence;
};
Terrain.prototype.getType = function()
{
   return "terrain";
};
Terrain.prototype.getModel = function()
{
   return this.model;
};
Terrain.prototype.getHBonus = function()
{
   return this.hb_bonus;
};
ground = new Terrain("ground","ground_mc",2,1);
street = new Terrain("street","street_mc",1,0);
wood = new Terrain("wood","wood_mc",4,2);
hill = new Terrain("hill","hill_mc",5,3);
river = new Terrain("river","river_mc",0,0);
sea = new Terrain("sea","sea_mc",0,0);
waterway = new Terrain("waterway","waterway_mc",0,0);
hedgerows = new Terrain("hedgerows","hedgerows_mc",3,2);
desert = new Terrain("desert","desert_mc",0,0);
swamp = new Terrain("swamp","swamp_mc",0,0);
beach = new Terrain("beach","beach_mc",0,0);
blocker = new Terrain("blocker","blocker_mc",0,0);
City = function(type, owner, model, row, col, player)
{
   this.type = type;
   this.owner = owner;
   this.model = model;
   this.row = row;
   this.col = col;
   this.player = player;
};
City.prototype = new MovieClip();
City.prototype.isNeutral = function()
{
   if(this.player == null)
   {
      trace("city Is Neutral!");
      return true;
   }
   trace("city Is Occupied!");
   return false;
};
City.prototype.getModel = function()
{
   return this.model;
};
City.prototype.getName = function()
{
   return _root[this.type].name;
};
City.prototype.getNameLang = function()
{
   var _loc3_ = null;
   switch(this.type)
   {
      case "Headquarter":
         _loc3_ = _root.LanguageObj.ID_46;
         break;
      case "Airport":
         _loc3_ = _root.LanguageObj.ID_42;
         break;
      case "Town":
         _loc3_ = _root.LanguageObj.ID_41;
         break;
      case "Factory":
         _loc3_ = _root.LanguageObj.ID_43;
         break;
      case "Harbour":
         _loc3_ = _root.LanguageObj.ID_45;
         break;
      case "Village":
         _loc3_ = _root.LanguageObj.ID_40;
         break;
      case "Barracks":
         _loc3_ = _root.LanguageObj.ID_44;
         break;
      case "LightFactory":
         _loc3_ = _root.LanguageObj.ID_175;
   }
   return _loc3_;
};
City.prototype.getBattleBonus = function()
{
   return _root[this.type].BattleBonus;
};
City.prototype.getOwner = function()
{
   return this.owner;
};
City.prototype.getType = function()
{
   return this.type;
};
City.prototype.getPlayer = function()
{
   return this.player;
};
City.prototype.setPlayer = function(player)
{
   this.player = player;
   if(this.player.type == "crusader")
   {
      this.owner = "crusader";
      this.mc.gotoAndStop("cr");
   }
   else if(this.player.type == "sarazen")
   {
      this.owner = "sarazen";
      this.mc.gotoAndStop("sa");
   }
   else
   {
      this.owner = "no";
      this.mc.gotoAndStop("no");
   }
};
City.prototype.getGoldTurn = function()
{
   return _root[this.type].GoldTurn;
};
City.prototype.checkSupplyCapabilities = function(category)
{
   switch(this.type)
   {
      case "Headquarter":
         if(category != "Water")
         {
            return true;
         }
         break;
      case "Airport":
         if(category == "Air")
         {
            return true;
         }
         break;
      case "Town":
         if(category != "Water" && category != "Air")
         {
            return true;
         }
         break;
      case "Factory":
         return false;
         break;
      case "Harbour":
         if(category == "Water")
         {
            return true;
         }
         break;
      case "Village":
         return false;
         break;
      case "Barracks":
         return false;
         break;
      case "LightFactory":
         return false;
   }
   return false;
};
Headquarter = {name:"Headquarter",model:"headquarter_mc",aiScore:300,GoldTurn:2,BattleBonus:1};
Airport = {name:"Airport",model:"airport_mc",aiScore:100,GoldTurn:0,BattleBonus:2};
Town = {name:"Town",model:"town_mc",aiScore:101,GoldTurn:4,BattleBonus:3};
Factory = {name:"Factory",model:"factory_mc",aiScore:100,GoldTurn:0,BattleBonus:2};
Harbour = {name:"Harbour",model:"harbour_mc",aiScore:100,GoldTurn:0,BattleBonus:2};
Village = {name:"Village",model:"village_mc",aiScore:70,GoldTurn:1,BattleBonus:1};
Bunker = {name:"Bunker",model:"bunker_mc",aiScore:90,GoldTurn:0,BattleBonus:3};
FortifiedTown = {name:"Fortified Town",model:"foTown_mc",aiScore:100,GoldTurn:4,BattleBonus:4};
Depot = {name:"Depot",model:"depot_mc",aiScore:101,GoldTurn:0,BattleBonus:0};
Barracks = {name:"Barracks",model:"barracks_mc",aiScore:100,GoldTurn:0,BattleBonus:2};
LightFactory = {name:"LightFactory",model:"liFactory_mc",aiScore:100,GoldTurn:0,BattleBonus:2};
Unit = function(unitID, type, row, col, owner, hp, player, world)
{
   this.unitID = unitID;
   this.type = type;
   this.row = row;
   this.col = col;
   this.owner = owner;
   this.hitPoints = hp;
   this.player = player;
   this.world = world;
   this.FightCategory_Attack = 0;
   this.FightCategory_Defend = 1;
   this.State_WaitingForOrder = 0;
   this.State_FinishedMoving = 1;
   this.State_Finished = 2;
   this.state = 0;
   this.fuel = _root[this.type].fuel;
   this.ammo = _root[this.type].ammo;
   this.isMoving = false;
};
Unit.prototype = new MovieClip();
Unit.prototype.getSpecialTerrainBonus = function()
{
   var _loc3_ = this.world.map.terrain[this.row][this.col];
   var _loc2_ = _loc3_.getHBonus();
   trace("getSpecialTerrainBonus:" + _loc2_);
   return _loc2_;
};
Unit.prototype.canCaptureCity = function()
{
   var _loc3_ = _root[this.type].type;
   trace("canCaptureCity: " + _loc3_);
   if(_loc3_ == "Human")
   {
      return true;
   }
   return false;
};
Unit.prototype.getTypeID = function()
{
   return _root[this.type].ID;
};
Unit.prototype.getBehavior = function()
{
   return _root[this.type].behaviour;
};
Unit.prototype.getState = function()
{
   return this.state;
};
Unit.prototype.setState = function(state)
{
   this.state = state;
};
Unit.prototype.getPlayer = function()
{
   return this.player;
};
Unit.prototype.getHP = function()
{
   return this.hitPoints;
};
Unit.prototype.GetHitpointsInPercent = function()
{
   var _loc4_ = _root[this.type].hitPoints;
   var _loc5_ = this.hitPoints;
   var _loc3_ = _loc5_ / _loc4_ * 100;
   trace("GetHitpointsInPercent: " + _loc3_);
   return _loc3_;
};
Unit.prototype.getID = function()
{
   return this.id;
};
Unit.prototype.getOwner = function()
{
   return this.owner;
};
Unit.prototype.getAmmo = function()
{
   return this.ammo;
};
Unit.prototype.GetAmmoInPercent = function()
{
   var _loc5_ = _root[this.type].ammo;
   var _loc4_ = this.ammo;
   var _loc3_ = _loc4_ / _loc5_ * 100;
   trace("GetAmmoInPercent: " + _loc3_);
   return _loc3_;
};
Unit.prototype.getModel = function()
{
   switch(this.player.type)
   {
      case "crusader":
         return _root[this.type].model[0];
      case "sarazen":
         return _root[this.type].model[1];
      default:
         trace("no model type!");
         return null;
   }
};
Unit.prototype.getName = function()
{
   return _root[this.type].name;
};
Unit.prototype.getFuel = function()
{
   return this.fuel;
};
Unit.prototype.GetFuelInPercent = function()
{
   var _loc4_ = _root[this.type].fuel;
   var _loc5_ = this.fuel;
   var _loc3_ = _loc5_ / _loc4_ * 100;
   trace("GetFuelInPercent: " + _loc3_);
   return _loc3_;
};
Unit.prototype.getType = function()
{
   return this.type;
};
Unit.prototype.getTypeLang = function()
{
   var _loc3_ = null;
   switch(this.type)
   {
      case "Guard":
         _loc3_ = _root.LanguageObj.ID_33;
         break;
      case "Archer":
         _loc3_ = _root.LanguageObj.ID_23;
         break;
      case "Swordsman":
         _loc3_ = _root.LanguageObj.ID_21;
         break;
      case "Spearman":
         _loc3_ = _root.LanguageObj.ID_22;
         break;
      case "Catapult":
         _loc3_ = _root.LanguageObj.ID_29;
         break;
      case "Trebuchet":
         _loc3_ = _root.LanguageObj.ID_31;
         break;
      case "Ballista":
         _loc3_ = _root.LanguageObj.ID_30;
         break;
      case "SiegeTower":
         _loc3_ = _root.LanguageObj.ID_24;
         break;
      case "BowCavalry":
         _loc3_ = _root.LanguageObj.ID_177;
         break;
      case "LightCavalry":
         _loc3_ = _root.LanguageObj.ID_26;
         break;
      case "HeavyCavalry":
         _loc3_ = _root.LanguageObj.ID_27;
         break;
      case "Ship":
         _loc3_ = _root.LanguageObj.ID_28;
         break;
      case "FlyingUnit":
         _loc3_ = _root.LanguageObj.ID_25;
   }
   return _loc3_;
};
Unit.prototype.getTypeCatLang = function()
{
   var _loc3_ = null;
   switch(this.getTypeCat())
   {
      case "Human":
         _loc3_ = _root.LanguageObj.ID_34;
         break;
      case "Soft":
         _loc3_ = _root.LanguageObj.ID_35;
         break;
      case "Hard":
         _loc3_ = _root.LanguageObj.ID_36;
         break;
      case "Air":
         _loc3_ = _root.LanguageObj.ID_37;
         break;
      case "Water":
         _loc3_ = _root.LanguageObj.ID_38;
   }
   return _loc3_;
};
Unit.prototype.getTypeCat = function()
{
   return _root[this.type].type;
};
Unit.prototype.getMovementCost = function(terrain)
{
   return _root[this.type].moveCosts[terrain];
};
Unit.prototype.getMovement = function()
{
   var _loc3_ = _root[this.type].movePoints;
   if(this.fuel != "endless" && this.fuel <= 0)
   {
      return 1;
   }
   return _loc3_;
};
Unit.prototype.getNumberOfFights = function(category, attack)
{
   var _loc3_ = _root[this.type].NumberOfFights[category][attack];
   if(this.ammo != "endless" && this.ammo <= 0)
   {
      return _loc3_ / 3;
   }
   return _loc3_;
};
Unit.prototype.getRange = function()
{
   return _root[this.type].range;
};
Unit.prototype.getMovePoints = function()
{
   return _root[this.type].movePoints;
};
Unit.prototype.getMinRange = function()
{
   return _root[this.type].minRange;
};
Unit.prototype.getInitiative = function()
{
   return _root[this.type].initiative;
};
Unit.prototype.getPrice = function()
{
   return _root[this.type].price;
};
Unit.prototype.computeDistance = function(enemy)
{
   if(this.row <= enemy.row)
   {
      var _loc3_ = enemy.row - this.row;
   }
   else if(this.row > enemy.row)
   {
      _loc3_ = this.row - enemy.row;
   }
   if(this.col <= enemy.col)
   {
      var _loc5_ = enemy.col - this.col;
   }
   else if(this.col > enemy.col)
   {
      _loc5_ = this.col - enemy.col;
   }
   else
   {
      trace("Unit.computeDistance ERROR!");
   }
   var _loc4_ = _loc3_ + _loc5_;
   return _loc4_;
};
Unit.prototype.moveMC = function(world, unit)
{
   if(world.Path.length < 1)
   {
      if(unit.player.PLAYER_TYPE == TYPE_COMPUTER)
      {
         trace("ai move done");
         if(unit.getBehavior() == "FightAndMove")
         {
            unit.state = unit.State_FinishedMoving;
         }
         else
         {
            unit.state = unit.State_Finished;
         }
         unit.showHitPoints();
         world.clearMovementMap();
      }
      else
      {
         world.game.SBshowUnitInfo(unit);
         if(!_root.showActionList)
         {
            var _loc9_ = world.createBattle(unit);
         }
         else
         {
            _loc9_ = null;
         }
         if(unit.getBehavior() == "FightAndMove" && _loc9_ != null)
         {
            unit.state = unit.State_FinishedMoving;
            world.showBattles(unit);
         }
         else
         {
            unit.state = unit.State_Finished;
         }
         unit.showHitPoints();
         if(!_root.showActionList)
         {
            trace("moveMC() enableUserControl");
            world.game.enableUserControl();
         }
      }
      clearInterval(_root.moveUnitINT);
      unit.isMoving = false;
      return undefined;
   }
   if(world.Path.length == 1)
   {
      world.map.units[unit.row][unit.col] = null;
      unit.row = world.Path[world.Path.length - 1][0];
      unit.col = world.Path[world.Path.length - 1][1];
      world.map.units[unit.row][unit.col] = unit;
   }
   var _loc8_ = world.Path[world.Path.length - 1][0];
   var _loc7_ = world.Path[world.Path.length - 1][1];
   var _loc5_ = _loc8_ * world.gridsize;
   var _loc6_ = _loc7_ * world.gridsize;
   var _loc4_ = 10;
   if(unit.mc._x + _loc4_ < _loc6_)
   {
      unit.mc._x = unit.mc._x + _loc4_;
   }
   else if(unit.mc._x - _loc4_ > _loc6_)
   {
      unit.mc._x = unit.mc._x - _loc4_;
   }
   else
   {
      unit.mc._x = _loc6_;
   }
   if(unit.mc._y + _loc4_ < _loc5_)
   {
      unit.mc._y = unit.mc._y + _loc4_;
   }
   else if(unit.mc._y - _loc4_ > _loc5_)
   {
      unit.mc._y = unit.mc._y - _loc4_;
   }
   else
   {
      unit.mc._y = _loc5_;
   }
   if(unit.mc._x == _loc6_ && unit.mc._y == _loc5_)
   {
      world.Path.pop();
   }
};
Unit.prototype.move = function(row, col)
{
   this.isMoving = true;
   this.reduceFuel(1);
   this.world.pathing(row,col,this);
   this.world.game.disableUserControl();
   _root.moveUnitINT = setInterval(this.moveMC,30,this.world,this);
   if(!_root.showActionList && this.currPlayer.PLAYER_TYPE != TYPE_COMPUTER)
   {
      _root.ActionList.push(_root.ACTION_MOVE + "x" + this.unitID + "*" + row + "-" + col);
   }
};
Unit.prototype.delWarning = function()
{
   this.mc.warning_mc.gotoAndStop(1);
};
Unit.prototype.setWarning = function()
{
   if(this.fuel != "endless" && this.fuel <= 1)
   {
      this.mc.warning_mc.gotoAndPlay(5);
   }
   else if(this.ammo != "endless" && this.ammo <= 1)
   {
      this.mc.warning_mc.gotoAndPlay(5);
   }
   else
   {
      this.mc.warning_mc.gotoAndStop(1);
   }
};
Unit.prototype.reduceFuel = function(val)
{
   trace("reduceFuel:" + this.fuel);
   if(this.fuel != "endless" && this.fuel > 0)
   {
      this.fuel = this.fuel - val;
   }
   trace("newFuel:" + this.fuel);
};
Unit.prototype.reduceAmmo = function(val)
{
   trace("reduceAmmo:" + this.ammo);
   if(this.ammo != "endless" && this.ammo > 0)
   {
      this.ammo = this.ammo - val;
   }
   trace("newAmmo:" + this.ammo);
};
Unit.prototype.supportHP = function()
{
   trace("supportHP()");
   var _loc3_ = _root[this.type].hitPoints;
   if(this.hitPoints < _loc3_)
   {
      this.hitPoints = this.hitPoints + 1;
   }
};
Unit.prototype.supportFuelAmmo = function()
{
   var _loc4_ = false;
   var _loc3_ = _root[this.type].fuel;
   var _loc5_ = _root[this.type].ammo;
   if(_loc3_ != "endless" && _loc3_ > this.fuel)
   {
      _loc4_ = true;
      this.fuel = _loc3_;
   }
   if(_loc5_ != "endless" && _loc5_ > this.ammo)
   {
      _loc4_ = true;
      this.ammo = _loc5_;
   }
   if(_loc4_)
   {
      trace("supportFuelAmmo()");
      this.showSupportOnStage();
   }
};
Unit.prototype.getHurt = function(val)
{
   var _loc2_ = Math.round(val);
   this.hitPoints = this.hitPoints - _loc2_;
   if(this.hitPoints <= 0)
   {
      if(!BATTLEWINDOW)
      {
         this.showDestroyOnStage();
      }
      this.destroyItem();
   }
   else
   {
      if(!BATTLEWINDOW)
      {
         this.showBattleOnStage(_loc2_);
      }
      this.showHitPoints();
   }
};
Unit.prototype.showHitPoints = function()
{
   if(this.hitPoints < 10)
   {
      var _loc2_ = "0" + this.hitPoints;
   }
   else
   {
      _loc2_ = this.hitPoints;
   }
   this.mc.hp_txt.text = _loc2_;
   if(this.state == this.State_WaitingForOrder)
   {
      myFormat = new TextFormat();
      myFormat.color = 6749952;
      this.mc.hp_txt.setTextFormat(myFormat);
      myColor = new Color(this.mc.blinki_mc);
      myColor.setRGB(6749952);
      this.mc.blinki_mc.gotoAndPlay(5);
   }
   else if(this.state == this.State_FinishedMoving)
   {
      myFormat = new TextFormat();
      myFormat.color = 16737792;
      this.mc.hp_txt.setTextFormat(myFormat);
      myColor = new Color(this.mc.blinki_mc);
      myColor.setRGB(16737792);
      this.mc.blinki_mc.gotoAndPlay(5);
   }
   else
   {
      this.mc.blinki_mc.gotoAndPlay(1);
      myFormat = new TextFormat();
      myFormat.color = 16777215;
      this.mc.hp_txt.setTextFormat(myFormat);
      myColor = new Color(this.mc.blinki_mc);
      myColor.setRGB(16777215);
      this.mc.blinki_mc.gotoAndPlay(1);
   }
};
Unit.prototype.displayMC = function()
{
   var _loc4_ = this.world.Units_StartLevel + this.unitID;
   this.world.map.units[this.row][this.col] = this;
   var _loc2_ = this.getModel();
   Object.registerClass(_loc2_,Unit);
   var _loc3_ = {_x:this.col * this.world.gridsize,_y:this.row * this.world.gridsize};
   this.world.loc.attachMovie(_loc2_,"unit_" + this.unitID,_loc4_,_loc3_);
   this.mc = this.world.loc["unit_" + this.unitID];
   this.mc.unit = this;
   this.mc.world = this.world;
};
Unit.prototype.destroyItem = function()
{
   trace("destroyItem: " + this.type + " pl: " + this.player.type + " id: " + this.unitID);
   this.world.map.units[this.row][this.col] = null;
   trace("map: " + this.world.map.units[this.row][this.col]);
   for(var _loc3_ in this.world.unitList)
   {
      if(this == this.world.unitList[_loc3_])
      {
         this.world.unitList.splice(_loc3_,1);
      }
   }
   trace("mc: " + this.mc);
   removeMovieClip(this.mc);
   this.world.game.addDefeatToGameStats(this.player);
   if(this.world.noMoreUnitLeft(this.player))
   {
      _root.GameStats.Winner = this.player.getEnemyType();
      this.world.game.makeGameStats();
      if(_root.GameMode == "OnlineGame")
      {
         this.disableUserControl();
         _root.endOnlineGameINT = setInterval(this.world.game.endOnlineGame,3500);
      }
      else
      {
         _root.gotoAndPlay("result");
      }
   }
};
Unit.prototype.showBattleOnStage = function(Damage)
{
   this.world.BattleFX_StartLevel = this.world.BattleFX_StartLevel + 1;
   var _loc2_ = this.world.BattleFX_StartLevel;
   var _loc5_ = {_y:this.row * this.world.gridsize - 91,_x:this.col * this.world.gridsize - 4,game:this.world.game,Damage:"-" + Math.round(Damage)};
   this.world.loc.attachMovie("battleFX_mc","onStageBattle_" + _loc2_,_loc2_,_loc5_);
   var _loc3_ = this.world.loc["onStageBattle_" + _loc2_];
   if(Damage <= 0)
   {
      _loc3_.gotoAndPlay(_loc3_._totalframes);
   }
};
Unit.prototype.showDestroyOnStage = function()
{
   this.world.BattleFX_StartLevel = this.world.BattleFX_StartLevel + 1;
   var _loc2_ = this.world.BattleFX_StartLevel;
   var _loc3_ = {_y:this.row * this.world.gridsize - 91,_x:this.col * this.world.gridsize - 4,game:this.world.game};
   this.world.loc.attachMovie("destroyFX_mc","onStageDestroy_" + _loc2_,_loc2_,_loc3_);
};
Unit.prototype.showSupportOnStage = function()
{
   this.world.BattleFX_StartLevel = this.world.BattleFX_StartLevel + 1;
   var _loc2_ = this.world.BattleFX_StartLevel;
   var _loc3_ = {_y:this.row * this.world.gridsize - 91,_x:this.col * this.world.gridsize - 4,game:this.world.game};
   this.world.loc.attachMovie("supportFX_mc","onStageSupport_" + _loc2_,_loc2_,_loc3_);
};
Guard = {ID:1,name:"Guard",type:"Human",model:["crusader_guard_mc","sarazen_guard_mc"],movePoints:4,moveCosts:{ground:2,street:1,wood:4,hill:-1,river:-1,sea:-1,waterway:-1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:5,initiative:3,NumberOfFights:{Human:[3,3],Soft:[2,2],Hard:[1,1],Air:[0,1],Water:[0,1]},range:1,minRange:1,behaviour:"FightAndMove",price:7,ammo:"endless",fuel:"endless",recon:6,prodBuilding:"Barracks",quality:1};
Archer = {ID:2,name:"Archer",type:"Human",model:["crusader_archer_mc","sarazen_archer_mc"],movePoints:6,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:10,initiative:1,NumberOfFights:{Human:[3,3],Soft:[2,2],Hard:[1,1],Air:[3,3],Water:[2,2]},range:2,minRange:1,behaviour:"FightAndMove",price:20,ammo:10,fuel:10,recon:6,prodBuilding:"Barracks",quality:3};
Swordsman = {ID:3,name:"Swordsman",type:"Human",model:["crusader_swordsman_mc","sarazen_swordsman_mc"],movePoints:5,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[4,4],Soft:[2,2],Hard:[2,2],Air:[0,1],Water:[0,1]},range:1,minRange:1,behaviour:"FightAndMove",price:15,ammo:"endless",fuel:10,recon:6,prodBuilding:"Barracks",quality:3};
Spearman = {ID:4,name:"Spearman",type:"Human",model:["crusader_spearman_mc","sarazen_spearman_mc"],movePoints:5,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[3,3],Soft:[5,5],Hard:[1,1],Air:[0,2],Water:[0,1]},range:1,minRange:1,behaviour:"FightAndMove",price:10,ammo:"endless",fuel:10,recon:6,prodBuilding:"Barracks",quality:2};
Catapult = {ID:5,name:"Catapult",type:"Hard",model:["crusader_catapult_mc","sarazen_catapult_mc"],movePoints:4,moveCosts:{ground:2,street:1,wood:5,hill:-1,river:-1,sea:-1,waterway:-1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[1,1],Soft:[1,1],Hard:[3,3],Air:[0,1],Water:[2,2]},range:3,minRange:2,behaviour:"FightOrMove",price:30,ammo:6,fuel:10,recon:4,prodBuilding:"Factory",quality:5};
Trebuchet = {ID:6,name:"Trebuchet",type:"Hard",model:["crusader_trebuchet_mc","sarazen_trebuchet_mc"],movePoints:3,moveCosts:{ground:2,street:1,wood:-1,hill:-1,river:-1,sea:-1,waterway:-1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:10,initiative:4,NumberOfFights:{Human:[2,2],Soft:[1,1],Hard:[4,4],Air:[0,0],Water:[1,1]},range:4,minRange:2,behaviour:"FightOrMove",price:45,ammo:5,fuel:10,recon:4,prodBuilding:"Factory",quality:5};
Ballista = {ID:7,name:"Ballista",type:"Hard",model:["crusader_ballista_mc","sarazen_ballista_mc"],movePoints:4,moveCosts:{ground:2,street:1,wood:4,hill:-1,river:-1,sea:-1,waterway:-1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[3,3],Soft:[2,2],Hard:[1,1],Air:[1,1],Water:[1,1]},range:4,minRange:2,behaviour:"FightOrMove",price:35,ammo:5,fuel:10,recon:4,prodBuilding:"Factory",quality:6};
SiegeTower = {ID:8,name:"SiegeTower",type:"Human",model:["crusader_tower_mc","sarazen_tower_mc"],movePoints:3,moveCosts:{ground:2,street:1,wood:-1,hill:-1,river:-1,sea:-1,waterway:-1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:12,initiative:4,NumberOfFights:{Human:[3,4],Soft:[2,3],Hard:[1,1],Air:[3,3],Water:[1,1]},range:2,minRange:1,behaviour:"FightOrMove",price:50,ammo:10,fuel:10,recon:4,prodBuilding:"Factory",quality:5};
BowCavalry = {ID:9,name:"BowCavalry",type:"Soft",model:["crusader_b-cavalry_mc","sarazen_b-cavalry_mc"],movePoints:8,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:10,initiative:1,NumberOfFights:{Human:[3,3],Soft:[2,2],Hard:[1,1],Air:[4,4],Water:[2,2]},range:2,minRange:1,behaviour:"FightAndMove",price:30,ammo:8,fuel:8,recon:4,prodBuilding:"LightFactory",quality:4};
LightCavalry = {ID:10,name:"LightCavalry",type:"Soft",model:["crusader_l-cavalry_mc","sarazen_l-cavalry_mc"],movePoints:8,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[4,4],Soft:[3,3],Hard:[2,2],Air:[0,2],Water:[0,1]},range:1,minRange:1,behaviour:"FightAndMove",price:25,ammo:"endless",fuel:8,recon:4,prodBuilding:"LightFactory",quality:4};
HeavyCavalry = {ID:11,name:"HeavyCavalry",type:"Soft",model:["crusader_h-cavalry_mc","sarazen_h-cavalry_mc"],movePoints:7,moveCosts:{ground:2,street:1,wood:3,hill:3,river:-1,sea:-1,waterway:1,hedgerows:2,desert:3,swamp:3,beach:3,blocker:-1},hitPoints:12,initiative:4,NumberOfFights:{Human:[5,5],Soft:[4,4],Hard:[3,3],Air:[0,3],Water:[0,2]},range:1,minRange:1,behaviour:"FightAndMove",price:35,ammo:"endless",fuel:6,recon:4,prodBuilding:"LightFactory",quality:5};
Ship = {ID:12,name:"Ship",type:"Water",model:["crusader_ship_mc","sarazen_ship_mc"],movePoints:8,moveCosts:{ground:-1,street:-1,wood:-1,hill:-1,river:-1,sea:1,waterway:1,hedgerows:-1,desert:-1,swamp:-1,beach:-1,blocker:-1},hitPoints:10,initiative:3,NumberOfFights:{Human:[2,2],Soft:[2,2],Hard:[2,2],Air:[0,1],Water:[2,2]},attackHuman:2,attackSoft:2,attackHard:2,attackAir:1,attackHighAir:0,attackWater:2,range:1,minRange:1,behaviour:"FightAndMove",price:40,ammo:"endless",fuel:10,recon:4,prodBuilding:"Harbour",quality:4};
FlyingUnit = {ID:13,name:"FlyingUnit",type:"Air",model:["crusader_flightunit_mc","sarazen_flightunit_mc"],movePoints:10,moveCosts:{ground:1,street:1,wood:1,hill:1,river:1,sea:1,waterway:1,hedgerows:1,desert:1,swamp:1,beach:1,blocker:-1},hitPoints:10,initiative:2,NumberOfFights:{Human:[4,4],Soft:[2,2],Hard:[2,2],Air:[3,3],Water:[2,2]},range:1,minRange:1,behaviour:"FightAndMove",price:50,ammo:"endless",fuel:5,recon:4,prodBuilding:"Airport",quality:5};
var UnitDataObjects = [Guard,Archer,Swordsman,Spearman,Catapult,Trebuchet,Ballista,SiegeTower,BowCavalry,LightCavalry,HeavyCavalry,Ship,FlyingUnit];
var UnitTypes = ["Human","Hard","Soft","Water","Air"];
map_f_1 = {deckID:1,name:"f_01_10x10",bgModel:"f_01_10x10.swf",units:[],cities:[["LightFactory","no","crusader_l-factory_mc",1,1],["Village","no","sarazen_village_mc",5,9],["Village","no","sarazen_village_mc",2,7],["Village","no","sarazen_village_mc",0,9],["Village","no","crusader_village_mc",3,0],["Village","no","crusader_village_mc",9,2],["Village","no","crusader_village_mc",6,3],["Town","no","sarazen_town_mc",8,6],["Town","no","sarazen_town_mc",6,7],["Town","no","sarazen_town_mc",1,9],["Town","sarazen","sarazen_town_mc",3,8],["Town","sarazen","sarazen_town_mc",3,9],["Barracks","crusader","crusader_barracks_mc",4,3],["Town","crusader","crusader_town_mc",5,1],["Town","no","crusader_town_mc",7,2],["Town","no","crusader_town_mc",1,3],["Town","no","crusader_town_mc",2,2],["LightFactory","no","sarazen_l-factory_mc",6,8],["Barracks","sarazen","sarazen_barracks_mc",4,8],["Headquarter","sarazen","sarazen_hq_mc",4,9],["Headquarter","crusader","crusader_hq_mc",4,1]],terrain:[[sea,sea,sea,sea,street,street,street,street,street,ground],[sea,street,street,street,street,hill,hill,hedgerows,street,street],[sea,ground,street,wood,wood,hill,hedgerows,ground,ground,street],[ground,ground,street,ground,wood,hill,sea,ground,street,street],[ground,street,street,street,ground,sea,sea,ground,street,street],[ground,street,ground,ground,hedgerows,sea,wood,ground,street,ground],[ground,street,street,ground,hedgerows,sea,wood,street,street,ground],[sea,hill,street,hill,sea,sea,street,street,hill,ground],[sea,hill,street,street,sea,sea,street,hill,hill,sea],[sea,sea,ground,street,street,street,street,sea,sea,sea]]};
map_f_2 = {deckID:2,name:"f_02_10x10",bgModel:"f_02_10x10.swf",units:[],cities:[["Village","no","sarazen_village_mc",1,7],["LightFactory","no","crusader_l-factory_mc",4,2],["Town","no","crusader_town_mc",8,1],["Village","no","sarazen_village_mc",7,9],["Village","no","sarazen_village_mc",5,7],["Town","no","sarazen_town_mc",3,7],["Town","no","sarazen_town_mc",5,9],["Town","no","sarazen_town_mc",4,8],["LightFactory","no","sarazen_l-factory_mc",9,6],["Barracks","sarazen","sarazen_barracks_mc",7,8],["Town","sarazen","sarazen_town_mc",8,7],["Headquarter","sarazen","sarazen_hq_mc",8,8],["Town","no","crusader_town_mc",7,2],["Town","no","crusader_town_mc",5,3],["Village","no","crusader_village_mc",6,1],["Village","no","crusader_village_mc",3,3],["Barracks","crusader","crusader_barracks_mc",1,2],["Town","crusader","crusader_town_mc",2,1],["Headquarter","crusader","crusader_hq_mc",1,1]],terrain:[[sea,sea,ground,ground,street,street,street,street,street,sea],[sea,street,street,street,street,hedgerows,hill,ground,street,sea],[sea,street,ground,ground,hill,hill,hedgerows,street,street,sea],[sea,street,ground,ground,hill,wood,ground,street,ground,ground],[sea,street,street,ground,wood,hill,ground,street,street,ground],[sea,sea,street,street,hedgerows,wood,hill,ground,street,street],[ground,ground,ground,street,wood,hill,hill,ground,street,ground],[ground,street,street,street,wood,hill,ground,ground,street,ground],[ground,street,wood,wood,hill,hill,street,street,street,ground],[ground,wood,wood,hill,hill,hedgerows,street,ground,ground,ground]]};
map_f_3 = {deckID:3,name:"f_03_20x10",bgModel:"f_03_20x10.swf",units:[],cities:[["Town","sarazen","sarazen_town_mc",3,15],["Town","no","sarazen_town_mc",6,16],["Village","no","crusader_village_mc",1,2],["Village","no","sarazen_village_mc",2,19],["Village","no","sarazen_village_mc",5,14],["Village","no","sarazen_village_mc",7,18],["Factory","no","sarazen_factory_mc",6,13],["Town","no","sarazen_town_mc",7,15],["Village","no","sarazen_village_mc",4,13],["Village","no","sarazen_village_mc",7,13],["Village","no","sarazen_village_mc",0,13],["Town","no","sarazen_town_mc",8,13],["Town","no","sarazen_town_mc",3,14],["Town","no","crusader_town_mc",5,8],["Factory","no","crusader_factory_mc",3,7],["Village","no","crusader_village_mc",5,1],["Village","no","crusader_village_mc",1,8],["Village","no","crusader_village_mc",4,5],["Village","no","crusader_village_mc",5,4],["Town","no","crusader_town_mc",3,4],["Town","no","crusader_town_mc",2,7],["Town","no","crusader_town_mc",4,6],["Town","no","crusader_town_mc",3,3],["LightFactory","no","crusader_l-factory_mc",7,5],["LightFactory","no","sarazen_l-factory_mc",5,18],["Town","sarazen","sarazen_town_mc",1,16],["Barracks","sarazen","sarazen_barracks_mc",3,17],["Headquarter","sarazen","sarazen_hq_mc",2,17],["Town","crusader","crusader_town_mc",7,3],["Barracks","crusader","crusader_barracks_mc",4,2],["Headquarter","crusader","crusader_hq_mc",6,2]],terrain:[[sea,sea,sea,sea,sea,sea,sea,ground,ground,sea,sea,sea,ground,ground,sea,sea,ground,ground,sea,sea],[sea,ground,ground,ground,sea,ground,ground,ground,ground,hill,hill,street,street,street,street,street,street,street,ground,sea],[sea,sea,ground,ground,ground,ground,ground,street,street,street,street,street,hill,hedgerows,street,hedgerows,ground,street,ground,ground],[sea,ground,ground,street,street,street,street,street,wood,hill,hill,hill,hedgerows,ground,street,street,street,street,ground,wood],[sea,ground,street,street,ground,ground,street,wood,wood,wood,hill,hill,ground,ground,ground,ground,street,ground,wood,wood],[ground,ground,street,ground,ground,ground,street,street,street,hill,hill,wood,wood,wood,ground,ground,street,street,street,wood],[ground,ground,street,street,ground,ground,street,wood,street,hill,hill,hill,wood,street,street,street,street,ground,ground,ground],[sea,ground,ground,street,street,street,street,hedgerows,street,street,street,street,hill,ground,street,street,ground,ground,ground,sea],[sea,sea,ground,ground,ground,ground,ground,ground,hill,hill,hill,street,street,street,street,ground,ground,ground,sea,sea],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,hill,hill,ground,ground,sea,sea,sea,sea,sea,sea]]};
map_f_4 = {deckID:4,name:"f_04_20x20",bgModel:"f_04_20x20.swf",units:[],cities:[["Village","no","sarazen_village_mc",15,6],["Town","no","crusader_town_mc",9,3],["Town","no","sarazen_town_mc",18,8],["Village","no","crusader_village_mc",12,3],["Airport","no","crusader_airport_mc",14,4],["Barracks","no","sarazen_barracks_mc",15,8],["Village","no","sarazen_village_mc",13,9],["Village","no","crusader_village_mc",7,8],["Town","no","crusader_town_mc",5,9],["Town","no","crusader_town_mc",8,7],["Town","no","crusader_town_mc",6,6],["Town","no","crusader_town_mc",5,3],["Village","no","sarazen_village_mc",17,13],["Town","no","sarazen_town_mc",14,12],["Town","no","sarazen_town_mc",16,11],["Barracks","sarazen","sarazen_barracks_mc",15,15],["Headquarter","sarazen","sarazen_hq_mc",15,14],["Town","sarazen","sarazen_town_mc",16,14],["Town","sarazen","sarazen_town_mc",16,15],["LightFactory","no","sarazen_l-factory_mc",14,17],["Airport","no","sarazen_airport_mc",13,18],["Town","no","sarazen_town_mc",12,12],["Village","no","sarazen_village_mc",11,15],["Factory","no","sarazen_factory_mc",10,13],["Factory","no","crusader_factory_mc",7,10],["Village","no","crusader_village_mc",6,12],["Village","no","sarazen_village_mc",10,17],["Town","no","sarazen_town_mc",9,18],["Town","no","sarazen_town_mc",8,17],["Town","no","sarazen_town_mc",6,16],["Village","no","sarazen_village_mc",6,18],["Town","no","crusader_town_mc",3,17],["Town","no","crusader_town_mc",2,13],["Village","no","crusader_village_mc",2,11],["LightFactory","no","crusader_l-factory_mc",1,8],["Town","crusader","crusader_town_mc",3,4],["Barracks","crusader","crusader_barracks_mc",2,6],["Headquarter","crusader","crusader_hq_mc",2,5]],terrain:[[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,hill,ground,ground,street,street,ground,hedgerows,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,street,street,street,ground,ground,street,ground,ground,hedgerows,street,street,hill,hill,hill,sea,sea],[sea,sea,sea,sea,street,hill,street,street,street,street,street,street,ground,hedgerows,street,street,street,street,sea,sea],[sea,sea,ground,ground,hill,street,street,hill,ground,ground,ground,street,hedgerows,street,street,street,hill,hill,sea,sea],[sea,sea,wood,street,street,street,hill,hill,hill,street,street,street,street,street,hill,street,ground,ground,sea,sea],[sea,sea,wood,wood,wood,street,street,ground,hill,hill,street,ground,ground,street,hill,street,street,hedgerows,ground,sea],[sea,sea,wood,wood,wood,wood,wood,wood,ground,river,street,street,street,street,hill,street,ground,hedgerows,hedgerows,sea],[sea,sea,swamp,ground,wood,ground,wood,street,river,river,river,street,ground,hill,ground,street,ground,street,hedgerows,sea],[sea,swamp,swamp,street,ground,ground,street,street,river,river,street,street,hill,hill,street,street,street,street,street,sea],[sea,ground,ground,street,ground,ground,street,river,river,street,street,hill,ground,street,street,wood,street,ground,sea,sea],[sea,ground,ground,street,street,street,street,street,street,street,hill,ground,ground,wood,wood,ground,street,wood,sea,sea],[sea,sea,ground,ground,ground,street,river,swamp,street,hill,hill,ground,street,street,wood,wood,street,wood,sea,sea],[sea,sea,ground,ground,street,street,river,swamp,street,ground,wood,wood,ground,street,street,street,street,street,street,sea],[sea,sea,sea,ground,street,ground,river,hill,street,street,street,street,street,ground,ground,street,ground,street,sea,sea],[sea,sea,sea,swamp,river,river,ground,hill,street,wood,street,street,wood,ground,street,street,ground,sea,sea,sea],[sea,sea,sea,swamp,river,hill,hill,hill,hill,wood,wood,street,ground,ground,street,street,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,hill,street,street,street,street,ground,ground,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,sea,street,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea]]};
map_f_5 = {deckID:5,name:"f_05_20x10",bgModel:"f_05_20x10.swf",units:[],cities:[["Factory","no","sarazen_factory_mc",6,6],["Factory","no","crusader_factory_mc",2,14],["Village","no","sarazen_village_mc",7,9],["Village","no","sarazen_village_mc",1,10],["Town","no","sarazen_town_mc",7,6],["Town","no","sarazen_town_mc",2,7],["LightFactory","no","crusader_l-factory_mc",6,14],["Town","no","crusader_town_mc",6,12],["Town","no","crusader_town_mc",2,15],["Village","no","crusader_village_mc",3,16],["Village","no","crusader_village_mc",9,18],["Village","no","crusader_village_mc",0,13],["Village","no","crusader_village_mc",4,15],["Village","no","crusader_village_mc",0,18],["Village","no","crusader_village_mc",1,19],["Town","no","crusader_town_mc",8,15],["Town","no","crusader_town_mc",8,16],["Town","no","crusader_town_mc",7,16],["Town","no","crusader_town_mc",5,16],["Town","crusader","crusader_town_mc",2,18],["Barracks","crusader","crusader_barracks_mc",4,17],["Headquarter","crusader","crusader_hq_mc",4,18],["LightFactory","no","sarazen_l-factory_mc",4,4],["Town","no","sarazen_town_mc",3,5],["Town","no","sarazen_town_mc",7,5],["Town","no","sarazen_town_mc",6,3],["Town","no","sarazen_town_mc",4,2],["Village","no","sarazen_village_mc",8,2],["Village","no","sarazen_village_mc",9,1],["Barracks","sarazen","sarazen_barracks_mc",2,2],["Village","sarazen","sarazen_village_mc",0,0],["Town","sarazen","sarazen_town_mc",1,1],["Headquarter","sarazen","sarazen_hq_mc",2,1]],terrain:[[ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,hedgerows,hedgerows,sea,sea,ground,ground],[ground,street,ground,ground,sea,sea,ground,ground,ground,ground,ground,street,street,street,street,hedgerows,ground,ground,ground,ground],[ground,street,street,ground,ground,ground,ground,street,street,street,street,street,wood,wood,street,street,street,street,street,ground],[ground,ground,street,ground,street,street,street,street,hill,hill,hill,hill,hill,wood,hedgerows,ground,ground,ground,street,ground],[sea,ground,street,street,street,wood,hill,hill,hill,wood,wood,hill,hill,hill,ground,ground,ground,street,street,ground],[sea,ground,ground,street,wood,hill,hill,wood,wood,hedgerows,hedgerows,hedgerows,wood,hill,hill,ground,street,street,ground,ground],[sea,sea,ground,street,hill,hill,street,street,street,street,street,street,street,street,street,ground,street,ground,ground,sea],[sea,sea,ground,street,street,street,street,hedgerows,ground,ground,ground,ground,ground,ground,street,street,street,ground,sea,sea],[sea,ground,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,ground,ground,street,street,ground,ground,sea],[ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground]]};
map_f_6 = {deckID:6,name:"f_06_10x20",bgModel:"f_06_10x20.swf",units:[],cities:[["Airport","no","sarazen_airport_mc",18,8],["Airport","no","crusader_airport_mc",0,3],["Factory","no","crusader_factory_mc",6,8],["Factory","no","sarazen_factory_mc",9,2],["Village","no","sarazen_village_mc",13,9],["Village","no","sarazen_village_mc",13,4],["Village","no","sarazen_village_mc",14,6],["Village","no","sarazen_village_mc",19,7],["Village","no","sarazen_village_mc",18,5],["Village","no","crusader_village_mc",5,8],["Village","no","crusader_village_mc",4,5],["Village","no","crusader_village_mc",4,1],["Village","no","crusader_village_mc",3,0],["Village","no","crusader_village_mc",1,1],["LightFactory","no","crusader_l-factory_mc",6,2],["LightFactory","no","sarazen_l-factory_mc",14,8],["Town","no","sarazen_town_mc",16,8],["Town","no","sarazen_town_mc",17,8],["Town","no","sarazen_town_mc",17,6],["Town","no","sarazen_town_mc",15,4],["Town","no","sarazen_town_mc",15,1],["Town","crusader","crusader_town_mc",1,9],["Town","no","crusader_town_mc",6,4],["Town","no","crusader_town_mc",4,2],["Town","no","crusader_town_mc",2,3],["Town","no","crusader_town_mc",2,5],["Town","no","crusader_town_mc",3,6],["Town","no","sarazen_town_mc",19,3],["Town","sarazen","sarazen_town_mc",18,3],["Town","no","crusader_town_mc",1,7],["Town","no","crusader_town_mc",2,8],["Town","sarazen","sarazen_town_mc",18,1],["Barracks","sarazen","sarazen_barracks_mc",17,1],["Headquarter","sarazen","sarazen_hq_mc",18,2],["Barracks","crusader","crusader_barracks_mc",2,7],["Headquarter","crusader","crusader_hq_mc",1,8]],terrain:[[ground,ground,ground,street,ground,ground,ground,ground,ground,ground],[ground,ground,ground,street,street,street,ground,street,street,street],[ground,ground,ground,street,hedgerows,street,ground,street,street,hill],[ground,ground,street,street,ground,street,street,street,hill,hill],[ground,ground,street,ground,ground,ground,ground,hill,hill,ground],[ground,ground,street,wood,ground,ground,ground,ground,ground,ground],[hill,hedgerows,street,street,street,street,street,street,street,hedgerows],[hedgerows,hill,hill,hill,hill,hill,wood,wood,street,hedgerows],[ground,wood,wood,wood,wood,hill,hill,hill,street,hill],[wood,ground,street,street,street,street,hill,street,street,ground],[river,river,street,wood,ground,street,hill,street,wood,river],[ground,ground,street,river,river,street,street,street,river,wood],[ground,hedgerows,street,street,ground,river,river,river,ground,ground],[ground,hill,hill,street,ground,ground,ground,ground,ground,ground],[ground,ground,hill,street,ground,ground,ground,hill,street,ground],[ground,street,street,street,street,street,hill,hill,street,ground],[ground,street,hedgerows,ground,hill,street,hedgerows,hill,street,ground],[ground,street,ground,ground,ground,street,street,street,street,ground],[ground,street,street,street,ground,ground,ground,ground,street,ground],[ground,ground,ground,street,ground,ground,ground,ground,ground,ground]]};
map_f_7 = {deckID:7,name:"f_07_10x20",bgModel:"f_07_10x20.swf",units:[["Guard","undefined",0,2,"crusader",5],["BowCavalry","undefined",3,8,"crusader",10],["Ballista","undefined",6,5,"crusader",10],["Swordsman","undefined",4,8,"crusader",10],["LightCavalry","undefined",14,8,"sarazen",10],["Swordsman","undefined",17,5,"sarazen",10],["Guard","undefined",19,7,"sarazen",5],["Trebuchet","undefined",10,7,"sarazen",10]],cities:[["Factory","no","sarazen_factory_mc",10,9],["Factory","no","crusader_factory_mc",6,6],["LightFactory","no","crusader_l-factory_mc",2,8],["LightFactory","no","sarazen_l-factory_mc",16,4],["Village","no","sarazen_village_mc",17,6],["Village","no","sarazen_village_mc",15,2],["Village","no","sarazen_village_mc",16,2],["Village","no","sarazen_village_mc",17,0],["Village","no","sarazen_village_mc",13,4],["Village","no","sarazen_village_mc",13,1],["Village","no","crusader_village_mc",1,9],["Village","no","crusader_village_mc",0,8],["Village","no","crusader_village_mc",4,6],["Village","no","crusader_village_mc",4,4],["Village","no","crusader_village_mc",3,3],["Village","no","crusader_village_mc",3,1],["Town","no","sarazen_town_mc",13,9],["Town","no","sarazen_town_mc",13,8],["Town","no","sarazen_town_mc",15,7],["Town","no","sarazen_town_mc",16,7],["Town","no","sarazen_town_mc",16,6],["Town","no","sarazen_town_mc",18,4],["Town","no","sarazen_town_mc",19,4],["Town","no","sarazen_town_mc",19,5],["Town","no","crusader_town_mc",6,2],["Town","no","crusader_town_mc",6,4],["Town","no","crusader_town_mc",6,7],["Town","no","crusader_town_mc",6,8],["Town","no","crusader_town_mc",5,8],["Town","no","crusader_town_mc",2,6],["Town","no","crusader_town_mc",2,5],["Town","no","crusader_town_mc",1,5],["Town","no","crusader_town_mc",1,1],["Town","sarazen","sarazen_town_mc",18,8],["Town","sarazen","sarazen_town_mc",18,9],["Town","crusader","crusader_town_mc",1,0],["Barracks","crusader","crusader_barracks_mc",0,1],["Barracks","sarazen","sarazen_barracks_mc",19,8],["Headquarter","sarazen","sarazen_hq_mc",19,9],["Headquarter","crusader","crusader_hq_mc",0,0]],terrain:[[street,street,street,street,street,street,ground,ground,ground,ground],[street,street,ground,ground,ground,street,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,street,street,street,ground],[ground,ground,ground,ground,ground,ground,ground,ground,street,ground],[ground,ground,ground,ground,ground,ground,ground,wood,street,ground],[hill,hill,ground,ground,ground,ground,wood,wood,street,hill],[hill,street,street,street,street,street,street,street,street,hill],[hill,street,ground,ground,ground,hill,hill,hill,hill,hill],[wood,street,street,ground,wood,swamp,wood,hill,hill,hill],[river,wood,street,wood,swamp,swamp,swamp,wood,wood,hill],[river,ground,street,street,street,street,street,street,street,street],[ground,river,ground,wood,wood,ground,ground,ground,wood,street],[ground,ground,river,ground,ground,ground,ground,ground,wood,street],[ground,ground,river,ground,ground,ground,ground,ground,street,street],[ground,ground,ground,river,ground,ground,ground,street,street,ground],[ground,ground,ground,ground,ground,ground,ground,street,ground,ground],[ground,ground,ground,ground,street,street,street,street,ground,ground],[ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[ground,ground,hedgerows,hedgerows,street,ground,ground,ground,street,street],[ground,hedgerows,hedgerows,hedgerows,street,street,street,street,street,street]]};
map_f_8 = {deckID:8,name:"f_08_15x15",bgModel:"f_08_15x15.swf",units:[["Swordsman","undefined",11,6,"sarazen",10],["Swordsman","undefined",9,9,"sarazen",10],["Spearman","undefined",12,13,"sarazen",10],["Spearman","undefined",13,10,"sarazen",10],["Spearman","undefined",1,3,"crusader",10],["Swordsman","undefined",3,8,"crusader",10],["Guard","undefined",1,9,"crusader",5]],cities:[["Airport","no","crusader_airport_mc",7,7],["Factory","no","crusader_factory_mc",5,2],["Factory","no","sarazen_factory_mc",9,12],["Town","no","sarazen_town_mc",9,10],["Town","no","sarazen_town_mc",10,9],["Town","no","sarazen_town_mc",11,8],["Town","no","crusader_town_mc",5,4],["Town","no","crusader_town_mc",4,5],["Town","no","crusader_town_mc",3,6],["LightFactory","no","crusader_l-factory_mc",2,9],["LightFactory","no","sarazen_l-factory_mc",12,5],["Village","no","sarazen_village_mc",14,6],["Village","no","sarazen_village_mc",11,1],["Village","no","sarazen_village_mc",11,3],["Village","no","sarazen_village_mc",13,13],["Village","no","sarazen_village_mc",14,12],["Village","no","sarazen_village_mc",11,11],["Village","no","sarazen_village_mc",11,13],["Village","no","sarazen_village_mc",12,12],["Village","no","sarazen_village_mc",13,9],["Village","no","sarazen_village_mc",12,7],["Village","no","crusader_village_mc",4,12],["Village","no","crusader_village_mc",3,11],["Village","no","crusader_village_mc",4,4],["Village","no","crusader_village_mc",0,6],["Village","no","crusader_village_mc",1,7],["Village","no","crusader_village_mc",2,6],["Village","no","crusader_village_mc",1,4],["Village","no","crusader_village_mc",3,2],["Village","no","crusader_village_mc",2,2],["Village","no","crusader_village_mc",1,1],["Town","no","crusader_town_mc",1,10],["Town","sarazen","sarazen_town_mc",13,4],["Town","sarazen","sarazen_town_mc",13,3],["Barracks","sarazen","sarazen_barracks_mc",13,2],["Town","crusader","crusader_town_mc",1,11],["Barracks","crusader","crusader_barracks_mc",1,12],["Headquarter","sarazen","sarazen_hq_mc",13,1],["Headquarter","crusader","crusader_hq_mc",1,13]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,street,street,street,street,street,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,street,street,street,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,wood,ground,ground,ground,ground,ground,ground,ground,ground],[hill,street,street,street,street,street,wood,wood,hill,street,street,street,street,street,ground],[hill,street,hill,wood,wood,wood,wood,street,hill,street,hill,hill,hill,street,ground],[hill,street,hill,hill,hill,street,street,street,street,street,hill,hill,hill,street,hill],[ground,street,hill,hill,hill,street,hill,street,wood,wood,wood,wood,hill,street,hill],[ground,street,street,street,street,street,hill,wood,wood,street,street,street,street,street,hill],[ground,ground,ground,ground,ground,ground,ground,ground,wood,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,street,street,street,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,street,street,street,street,street,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
map_f_9 = {deckID:9,name:"f_09_15x15",bgModel:"f_09_15x15.swf",units:[],cities:[["Village","no","sarazen_village_mc",12,0],["Village","no","crusader_village_mc",0,13],["Village","no","crusader_village_mc",4,7],["Town","no","sarazen_town_mc",9,10],["LightFactory","no","crusader_l-factory_mc",0,10],["Village","no","sarazen_village_mc",8,4],["Village","no","sarazen_village_mc",10,3],["Village","no","sarazen_village_mc",13,13],["Village","no","sarazen_village_mc",11,13],["Village","no","sarazen_village_mc",13,12],["Village","no","sarazen_village_mc",13,10],["Village","no","crusader_village_mc",1,2],["Village","no","crusader_village_mc",0,3],["Village","no","crusader_village_mc",5,12],["Village","no","crusader_village_mc",4,11],["Village","no","crusader_village_mc",3,10],["Village","no","crusader_village_mc",4,9],["Barracks","crusader","crusader_barracks_mc",7,14],["Town","crusader","crusader_town_mc",6,13],["Town","no","crusader_town_mc",7,13],["Town","no","crusader_town_mc",3,13],["Town","no","crusader_town_mc",2,13],["Town","no","crusader_town_mc",2,12],["Town","no","crusader_town_mc",1,10],["Town","no","crusader_town_mc",0,9],["Factory","no","crusader_factory_mc",3,4],["LightFactory","no","sarazen_l-factory_mc",13,2],["Factory","no","sarazen_factory_mc",11,10],["Town","no","sarazen_town_mc",14,7],["Town","no","sarazen_town_mc",14,5],["Town","no","sarazen_town_mc",13,3],["Town","no","sarazen_town_mc",11,2],["Town","no","sarazen_town_mc",10,1],["Town","sarazen","sarazen_town_mc",6,1],["Town","sarazen","sarazen_town_mc",7,1],["Barracks","sarazen","sarazen_barracks_mc",6,0],["Headquarter","sarazen","sarazen_hq_mc",7,0],["Headquarter","crusader","crusader_hq_mc",6,14]],terrain:[[ground,ground,ground,ground,ground,ground,ground,street,street,street,street,ground,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,street,ground,ground,street,street,ground,ground,ground],[ground,ground,ground,wood,ground,ground,ground,street,ground,ground,ground,street,street,street,ground],[ground,ground,wood,wood,street,street,street,street,street,ground,ground,ground,ground,street,ground],[wood,wood,wood,wood,street,wood,ground,ground,street,ground,ground,ground,ground,street,hill],[river,river,river,river,street,river,river,ground,street,street,street,hill,ground,street,hill],[street,street,hill,hill,street,wood,river,hedgerows,hedgerows,hedgerows,street,hill,hill,street,street],[street,street,hill,hill,street,street,river,river,river,hedgerows,street,hill,hill,street,street],[hill,street,hill,ground,ground,street,swamp,swamp,river,river,street,river,river,river,river],[hill,street,ground,ground,ground,street,swamp,swamp,swamp,wood,street,wood,wood,wood,ground],[ground,street,street,ground,ground,street,swamp,ground,wood,wood,street,wood,wood,ground,ground],[ground,ground,street,ground,ground,street,street,street,street,street,street,wood,ground,ground,ground],[ground,ground,street,ground,ground,ground,ground,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,street,street,street,ground,ground,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,ground,street,street,street,street,ground,ground,ground,ground,ground,ground,ground]]};
map_f_10 = {deckID:10,name:"f_10_20x20",bgModel:"f_10_20x20.swf",units:[["Guard","undefined",5,17,"crusader",5],["Spearman","undefined",16,8,"sarazen",10],["Ship","undefined",16,11,"sarazen",10],["Ship","undefined",15,10,"sarazen",10],["Ship","undefined",10,16,"crusader",10],["Ship","undefined",9,18,"crusader",10]],cities:[["Factory","no","sarazen_factory_mc",13,1],["Factory","no","crusader_factory_mc",1,10],["LightFactory","no","sarazen_l-factory_mc",12,3],["LightFactory","no","crusader_l-factory_mc",1,11],["Village","no","sarazen_village_mc",6,1],["Village","no","sarazen_village_mc",19,5],["Village","no","sarazen_village_mc",17,7],["Village","no","sarazen_village_mc",12,8],["Village","no","sarazen_village_mc",12,5],["Village","no","sarazen_village_mc",11,5],["Village","no","crusader_village_mc",0,6],["Village","no","crusader_village_mc",7,15],["Village","no","crusader_village_mc",7,13],["Village","no","crusader_village_mc",2,18],["Village","no","crusader_village_mc",1,17],["Village","no","crusader_village_mc",0,15],["Town","no","sarazen_town_mc",10,2],["Town","no","sarazen_town_mc",11,3],["Town","no","sarazen_town_mc",13,2],["Town","no","sarazen_town_mc",15,1],["Town","no","sarazen_town_mc",16,1],["Town","no","sarazen_town_mc",18,2],["Town","no","sarazen_town_mc",17,4],["Town","no","sarazen_town_mc",15,5],["Town","no","crusader_town_mc",2,8],["Town","no","crusader_town_mc",2,10],["Town","no","crusader_town_mc",2,12],["Town","no","crusader_town_mc",4,12],["Town","no","crusader_town_mc",6,13],["Town","no","crusader_town_mc",4,14],["Town","no","crusader_town_mc",3,16],["Town","no","crusader_town_mc",4,17],["Barracks","sarazen","sarazen_barracks_mc",15,8],["Town","sarazen","sarazen_town_mc",15,7],["Town","sarazen","sarazen_town_mc",14,7],["Headquarter","sarazen","sarazen_hq_mc",14,8],["Harbour","sarazen","sarazen_harbour_mc",14,9],["Town","no","crusader_town_mc",6,17],["Barracks","crusader","crusader_barracks_mc",7,17],["Town","crusader","crusader_town_mc",6,18],["Headquarter","crusader","crusader_hq_mc",7,18],["Harbour","crusader","crusader_harbour_mc",8,18]],terrain:[[river,river,ground,ground,ground,ground,ground,ground,ground,wood,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,river,river,hedgerows,hedgerows,hedgerows,ground,ground,wood,wood,street,street,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,river,hill,hill,hedgerows,street,street,street,street,street,ground,street,ground,street,street,street,ground,ground,ground],[ground,ground,river,river,hill,hill,street,hill,hill,wood,wood,ground,street,ground,street,ground,street,street,ground,ground],[ground,ground,ground,river,river,hill,street,hill,hill,hill,hill,ground,street,ground,street,ground,ground,street,ground,ground],[ground,ground,ground,hill,river,river,street,sea,hill,ground,ground,ground,street,ground,street,ground,ground,street,ground,ground],[ground,ground,hill,hill,hill,river,street,sea,sea,ground,ground,ground,street,street,street,ground,ground,street,street,ground],[ground,ground,hedgerows,hedgerows,hill,street,street,sea,sea,sea,ground,ground,ground,ground,ground,ground,ground,street,street,ground],[ground,street,street,street,street,street,hill,sea,sea,sea,ground,ground,ground,ground,ground,ground,ground,sea,sea,ground],[ground,street,ground,ground,ground,hill,hill,sea,sea,sea,sea,sea,ground,ground,ground,sea,sea,sea,sea,sea],[wood,street,street,street,ground,ground,hill,hill,sea,sea,sea,sea,sea,sea,ground,sea,sea,sea,sea,sea],[wood,wood,wood,street,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,wood,wood,street,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,street,street,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,ground,ground,ground,ground,ground,street,street,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,ground,ground,ground,street,street,street,street,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,ground,ground,street,street,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,ground,ground,street,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,street,street,street,street,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[ground,ground,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea]]};
map_f_11 = {deckID:11,name:"f_11_10x30",bgModel:"f_11_10x30.swf",units:[["Spearman","undefined",16,8,"crusader",10],["Spearman","undefined",28,4,"sarazen",10],["LightCavalry","undefined",20,8,"sarazen",10],["Spearman","undefined",2,2,"crusader",10]],cities:[["Airport","no","crusader_airport_mc",3,4],["Airport","no","sarazen_airport_mc",25,5],["LightFactory","no","sarazen_l-factory_mc",23,7],["Factory","no","sarazen_factory_mc",20,2],["LightFactory","no","crusader_l-factory_mc",4,6],["Factory","no","crusader_factory_mc",9,8],["Town","no","crusader_town_mc",7,8],["Town","no","crusader_town_mc",6,6],["Town","no","crusader_town_mc",4,5],["Town","no","crusader_town_mc",4,3],["Town","no","sarazen_town_mc",21,3],["Town","no","sarazen_town_mc",23,5],["Town","no","sarazen_town_mc",24,7],["Town","no","sarazen_town_mc",26,6],["Village","no","sarazen_village_mc",19,3],["Village","no","sarazen_village_mc",23,1],["Village","no","sarazen_village_mc",26,3],["Village","no","sarazen_village_mc",28,1],["Village","no","sarazen_village_mc",26,1],["Village","no","sarazen_village_mc",24,3],["Village","no","sarazen_village_mc",21,7],["Village","no","sarazen_village_mc",21,9],["Village","no","sarazen_village_mc",20,6],["Village","no","crusader_village_mc",11,7],["Village","no","crusader_village_mc",8,5],["Village","no","crusader_village_mc",6,5],["Village","no","crusader_village_mc",6,1],["Village","no","crusader_village_mc",5,2],["Village","no","crusader_village_mc",5,8],["Village","no","crusader_village_mc",2,8],["Village","no","crusader_village_mc",1,7],["Village","no","crusader_village_mc",2,5],["Village","no","crusader_village_mc",0,4],["Village","sarazen","sarazen_village_mc",28,3],["Village","sarazen","sarazen_village_mc",26,8],["Barracks","sarazen","sarazen_barracks_mc",28,6],["Town","sarazen","sarazen_town_mc",28,7],["Town","sarazen","sarazen_town_mc",29,6],["Headquarter","sarazen","sarazen_hq_mc",29,7],["Town","crusader","crusader_town_mc",1,1],["Barracks","crusader","crusader_barracks_mc",1,2],["Town","crusader","crusader_town_mc",0,2],["Headquarter","crusader","crusader_hq_mc",0,1]],terrain:[[ground,street,street,ground,ground,ground,ground,ground,ground,ground],[ground,street,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,street,ground,street,ground,ground,ground,ground,ground],[ground,ground,street,street,street,street,street,ground,ground,ground],[ground,ground,ground,ground,ground,ground,street,ground,ground,ground],[ground,ground,ground,ground,ground,ground,street,street,street,ground],[ground,ground,ground,ground,ground,ground,ground,ground,street,ground],[ground,street,street,street,street,ground,ground,ground,street,ground],[ground,street,ground,ground,street,street,street,street,street,ground],[ground,street,ground,ground,ground,ground,ground,ground,ground,ground],[wood,street,street,ground,ground,ground,ground,ground,ground,ground],[wood,wood,street,ground,ground,ground,ground,ground,wood,wood],[wood,hedgerows,street,street,street,street,wood,wood,wood,hedgerows],[hedgerows,hedgerows,street,swamp,swamp,street,street,street,hedgerows,hedgerows],[river,river,street,river,river,river,river,street,river,river],[hedgerows,street,street,street,swamp,swamp,swamp,street,street,hedgerows],[hedgerows,street,wood,street,street,street,swamp,swamp,street,hedgerows],[ground,street,wood,wood,wood,street,street,street,street,ground],[ground,street,wood,ground,ground,ground,ground,ground,ground,ground],[ground,street,street,ground,ground,ground,ground,ground,ground,ground],[ground,ground,street,street,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,street,street,street,street,ground,ground],[ground,ground,ground,ground,ground,ground,ground,street,ground,ground],[ground,ground,ground,ground,ground,street,street,street,ground,ground],[ground,ground,ground,ground,ground,ground,street,ground,ground,ground],[ground,ground,ground,ground,ground,ground,street,ground,ground,ground],[ground,ground,ground,ground,ground,ground,street,street,ground,ground],[ground,ground,ground,ground,ground,ground,street,street,ground,ground]]};
map_f_12 = {deckID:12,name:"f_12_20x15",bgModel:"f_12_20x15.swf",units:[["Guard","undefined",12,3,"sarazen",5],["LightCavalry","undefined",10,9,"sarazen",10],["Spearman","undefined",12,9,"sarazen",10],["Spearman","undefined",13,6,"sarazen",10],["Spearman","undefined",2,6,"crusader",10],["Spearman","undefined",0,12,"crusader",10],["Spearman","undefined",2,16,"crusader",10]],cities:[["Village","no","crusader_village_mc",3,12],["Village","no","crusader_village_mc",1,2],["Village","no","crusader_village_mc",3,7],["Village","no","crusader_village_mc",3,5],["Village","no","crusader_village_mc",5,19],["Village","no","crusader_village_mc",1,14],["Village","no","crusader_village_mc",1,11],["Village","no","crusader_village_mc",0,9],["Village","no","sarazen_village_mc",14,10],["Village","no","sarazen_village_mc",9,10],["Village","no","sarazen_village_mc",10,19],["Village","no","sarazen_village_mc",12,18],["Village","no","sarazen_village_mc",13,8],["Village","no","sarazen_village_mc",12,6],["Village","sarazen","sarazen_village_mc",9,1],["Village","sarazen","sarazen_village_mc",13,4],["Headquarter","crusader","crusader_hq_mc",2,19],["Headquarter","sarazen","sarazen_hq_mc",12,0],["Airport","no","sarazen_airport_mc",12,1],["Airport","no","crusader_airport_mc",2,18],["LightFactory","no","sarazen_l-factory_mc",11,8],["LightFactory","no","crusader_l-factory_mc",2,7],["Factory","no","crusader_factory_mc",4,4],["Factory","no","sarazen_factory_mc",11,16],["Town","no","sarazen_town_mc",13,14],["Town","no","sarazen_town_mc",12,12],["Town","no","sarazen_town_mc",11,10],["Town","no","sarazen_town_mc",10,8],["Town","no","sarazen_town_mc",9,6],["Town","no","sarazen_town_mc",10,5],["Town","no","sarazen_town_mc",11,4],["Town","no","crusader_town_mc",2,3],["Town","no","crusader_town_mc",1,4],["Town","no","crusader_town_mc",1,7],["Town","no","crusader_town_mc",2,9],["Town","no","crusader_town_mc",3,10],["Town","no","crusader_town_mc",3,13],["Town","no","crusader_town_mc",2,14],["Town","no","crusader_town_mc",3,18],["Town","crusader","crusader_town_mc",1,18],["Barracks","crusader","crusader_barracks_mc",2,17],["Town","no","sarazen_town_mc",13,1],["Barracks","sarazen","sarazen_barracks_mc",12,2],["Town","sarazen","sarazen_town_mc",11,1]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,river,river,river],[ground,ground,ground,street,street,street,street,street,ground,ground,ground,ground,ground,ground,ground,ground,river,river,street,river],[ground,ground,street,street,ground,ground,ground,street,street,street,street,ground,ground,street,street,street,street,street,street,street],[ground,ground,street,ground,ground,ground,ground,ground,ground,ground,street,ground,ground,street,ground,ground,river,river,street,river],[ground,ground,street,street,street,ground,ground,ground,wood,wood,street,street,street,street,hill,ground,ground,river,river,river],[ground,swamp,swamp,swamp,street,street,street,wood,wood,hill,hill,hill,hill,hill,hill,hill,wood,wood,ground,ground],[river,river,swamp,swamp,swamp,ground,street,street,street,street,street,street,street,street,hill,street,street,street,wood,ground],[ground,river,river,river,river,river,ground,street,hill,hill,hill,hill,hill,street,street,street,hill,street,street,ground],[ground,ground,ground,ground,ground,river,river,street,river,river,river,hill,hill,hill,hill,hill,river,river,street,river],[ground,ground,ground,ground,ground,street,street,street,street,ground,ground,hill,hill,hill,hill,hill,wood,street,street,ground],[river,river,river,ground,ground,street,ground,ground,street,ground,ground,ground,hill,wood,wood,wood,ground,street,ground,ground],[river,street,river,river,street,street,ground,ground,street,street,street,street,hill,wood,wood,ground,street,street,ground,ground],[street,street,street,street,street,ground,ground,ground,ground,ground,ground,street,street,wood,ground,ground,street,ground,ground,ground],[river,street,river,river,ground,ground,ground,ground,ground,ground,ground,ground,street,street,street,street,street,ground,ground,ground],[river,river,river,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
map_f_13 = {deckID:13,name:"f_13_30x10",bgModel:"f_13_30x10.swf",units:[],cities:[["Village","no","sarazen_village_mc",4,29],["Village","no","sarazen_village_mc",8,25],["Village","no","sarazen_village_mc",5,27],["Village","no","sarazen_village_mc",3,27],["Village","no","sarazen_village_mc",2,21],["Village","no","sarazen_village_mc",1,22],["Village","no","crusader_village_mc",7,9],["Village","no","crusader_village_mc",7,7],["Village","no","crusader_village_mc",6,3],["Village","no","crusader_village_mc",2,4],["Village","no","crusader_village_mc",0,3],["Village","no","crusader_village_mc",1,1],["Factory","no","sarazen_factory_mc",4,25],["Factory","no","crusader_factory_mc",5,5],["LightFactory","no","sarazen_l-factory_mc",7,25],["Town","no","sarazen_town_mc",7,28],["Town","no","sarazen_town_mc",5,28],["Town","no","sarazen_town_mc",6,24],["Town","no","sarazen_town_mc",1,24],["Town","no","sarazen_town_mc",3,24],["Town","no","sarazen_town_mc",5,25],["Town","no","sarazen_town_mc",8,27],["LightFactory","no","crusader_l-factory_mc",4,3],["Town","no","crusader_town_mc",1,7],["Town","no","crusader_town_mc",3,5],["Town","no","crusader_town_mc",8,5],["Town","no","crusader_town_mc",4,4],["Town","no","crusader_town_mc",6,6],["Town","no","crusader_town_mc",3,2],["Town","no","crusader_town_mc",4,1],["Town","no","crusader_town_mc",7,1],["Town","crusader","crusader_town_mc",8,2],["Barracks","crusader","crusader_barracks_mc",7,2],["Headquarter","crusader","crusader_hq_mc",8,1],["Town","sarazen","sarazen_town_mc",2,28],["Barracks","sarazen","sarazen_barracks_mc",2,27],["Town","sarazen","sarazen_town_mc",1,27],["Headquarter","sarazen","sarazen_hq_mc",1,28],["Airport","no","sarazen_airport_mc",5,15],["Factory","no","sarazen_factory_mc",4,14],["Barracks","no","sarazen_barracks_mc",5,14],["Town","no","sarazen_town_mc",4,15]],terrain:[[ground,ground,ground,ground,ground,hedgerows,hedgerows,hedgerows,hedgerows,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,hedgerows,street,street,street,street,street,street,street,street,street,street,street,street,sea,sea,ground,ground,ground,street,street,street,street,street,street,ground],[ground,ground,ground,ground,ground,street,street,swamp,swamp,swamp,sea,sea,sea,hill,hill,hill,hill,street,sea,sea,ground,ground,wood,street,ground,ground,ground,street,street,ground],[ground,street,street,street,ground,street,wood,ground,ground,swamp,sea,sea,hill,hill,hill,street,street,street,sea,sea,ground,wood,wood,street,street,street,ground,ground,street,ground],[ground,street,ground,street,street,street,wood,wood,ground,sea,sea,sea,hill,wood,street,street,wood,wood,sea,sea,sea,ground,wood,wood,wood,street,ground,ground,street,ground],[ground,street,ground,ground,wood,street,street,wood,ground,sea,sea,sea,wood,wood,street,street,wood,hill,sea,sea,sea,ground,ground,ground,wood,street,ground,ground,street,ground],[ground,street,ground,ground,wood,wood,street,ground,ground,ground,sea,sea,street,street,street,hill,hill,hill,sea,sea,swamp,swamp,swamp,street,street,street,ground,ground,street,ground],[ground,street,street,ground,ground,ground,street,ground,ground,ground,sea,sea,street,hill,hill,hill,hill,sea,sea,sea,swamp,swamp,street,street,ground,street,street,ground,street,ground],[ground,street,street,street,street,street,street,ground,ground,ground,sea,sea,street,street,street,street,street,street,street,street,street,street,street,hedgerows,ground,ground,street,street,street,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,hedgerows,hedgerows,hedgerows,ground,ground,ground,ground,ground,ground]]};
map_f_14 = {deckID:14,name:"f_14_15x20",bgModel:"f_14_15x20.swf",units:[["Swordsman","undefined",16,11,"sarazen",10],["Spearman","undefined",18,7,"sarazen",10],["Spearman","undefined",11,8,"sarazen",10],["Guard","undefined",2,3,"crusader",5],["Spearman","undefined",7,5,"crusader",10],["Spearman","undefined",0,5,"crusader",10]],cities:[["Village","no","sarazen_village_mc",17,6],["Village","no","sarazen_village_mc",16,13],["Village","no","sarazen_village_mc",19,9],["Village","no","sarazen_village_mc",18,8],["Village","no","sarazen_village_mc",19,6],["Village","no","sarazen_village_mc",15,14],["Village","no","sarazen_village_mc",12,10],["Village","no","sarazen_village_mc",14,9],["Village","no","sarazen_village_mc",13,8],["Village","no","sarazen_village_mc",11,9],["Village","no","crusader_village_mc",2,0],["Village","no","crusader_village_mc",4,1],["Village","no","crusader_village_mc",1,7],["Village","no","crusader_village_mc",1,5],["Village","no","crusader_village_mc",0,4],["Village","no","crusader_village_mc",6,6],["Village","no","crusader_village_mc",5,5],["Village","no","crusader_village_mc",5,8],["Village","no","crusader_village_mc",7,7],["Village","no","crusader_village_mc",7,4],["Town","no","sarazen_town_mc",14,12],["Town","no","sarazen_town_mc",10,12],["Town","no","sarazen_town_mc",12,13],["Town","no","sarazen_town_mc",17,11],["Town","no","sarazen_town_mc",15,11],["Town","no","sarazen_town_mc",16,9],["Town","no","sarazen_town_mc",15,6],["Town","no","crusader_town_mc",9,1],["Town","no","crusader_town_mc",8,2],["Town","no","crusader_town_mc",1,10],["Town","no","crusader_town_mc",2,9],["Town","no","crusader_town_mc",3,6],["Town","no","crusader_town_mc",4,3],["Town","no","crusader_town_mc",3,4],["Airport","no","crusader_airport_mc",6,2],["Airport","no","sarazen_airport_mc",13,13],["LightFactory","no","sarazen_l-factory_mc",16,7],["LightFactory","no","crusader_l-factory_mc",3,8],["Factory","no","crusader_factory_mc",10,2],["Factory","no","sarazen_factory_mc",9,13],["Town","sarazen","sarazen_town_mc",18,12],["Barracks","sarazen","sarazen_barracks_mc",17,12],["Town","crusader","crusader_town_mc",1,2],["Barracks","crusader","crusader_barracks_mc",2,2],["Headquarter","crusader","crusader_hq_mc",1,1],["Headquarter","sarazen","sarazen_hq_mc",18,13]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,hill,hill,hill,river],[ground,street,street,ground,ground,ground,ground,ground,ground,street,street,street,street,hill,river],[ground,ground,street,street,ground,ground,ground,ground,street,street,hill,hill,street,hill,river],[ground,ground,ground,street,street,street,street,street,street,ground,hill,hill,street,river,river],[ground,ground,ground,street,ground,ground,ground,ground,ground,ground,ground,hill,street,street,street],[ground,ground,street,street,ground,ground,ground,ground,ground,ground,ground,hill,hill,river,street],[ground,ground,street,ground,ground,ground,ground,ground,ground,ground,hill,hill,river,river,street],[wood,ground,street,ground,ground,ground,ground,ground,ground,ground,river,river,river,wood,street],[wood,street,street,ground,ground,ground,ground,ground,ground,river,river,wood,wood,street,street],[wood,street,wood,ground,ground,ground,river,river,river,river,wood,wood,street,street,wood],[wood,street,street,wood,ground,ground,river,ground,ground,ground,ground,wood,street,wood,wood],[wood,wood,street,wood,wood,ground,river,ground,ground,ground,ground,wood,street,street,wood],[wood,street,street,wood,river,river,river,ground,ground,ground,ground,ground,ground,street,wood],[wood,street,river,river,river,hill,ground,ground,ground,ground,ground,ground,street,street,ground],[street,street,river,hill,hill,hill,ground,ground,ground,ground,ground,street,street,ground,ground],[street,ground,river,hill,street,street,street,street,ground,ground,ground,street,ground,ground,ground],[street,river,river,street,street,hill,ground,street,street,street,street,street,ground,ground,ground],[street,street,street,street,hill,hill,ground,ground,ground,ground,ground,street,street,ground,ground],[river,river,hill,hill,hill,ground,ground,ground,ground,ground,ground,ground,street,street,ground],[river,hill,hill,hill,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
map_f_15 = {deckID:15,name:"f_15_15x15",bgModel:"f_15_15x15.swf",units:[["Guard","undefined",5,6,"crusader",5],["Guard","undefined",8,8,"sarazen",5],["Spearman","undefined",8,9,"sarazen",10],["Spearman","undefined",5,5,"crusader",10]],cities:[["Town","no","sarazen_town_mc",1,13],["Factory","no","sarazen_factory_mc",0,12],["Village","no","sarazen_village_mc",3,8],["Village","no","sarazen_village_mc",4,9],["Village","no","sarazen_village_mc",6,9],["Village","no","sarazen_village_mc",5,10],["Village","no","sarazen_village_mc",3,6],["Village","no","crusader_village_mc",11,9],["Village","no","crusader_village_mc",10,7],["Village","no","crusader_village_mc",10,5],["Village","no","crusader_village_mc",8,5],["Village","no","crusader_village_mc",7,4],["LightFactory","no","crusader_l-factory_mc",11,4],["LightFactory","no","sarazen_l-factory_mc",2,8],["Town","no","sarazen_town_mc",2,10],["Town","no","sarazen_town_mc",3,11],["Town","no","sarazen_town_mc",4,11],["Town","no","sarazen_town_mc",6,11],["Town","no","sarazen_town_mc",8,10],["Town","no","crusader_town_mc",12,5],["Town","no","crusader_town_mc",12,6],["Town","no","crusader_town_mc",10,3],["Town","no","crusader_town_mc",6,3],["Town","no","crusader_town_mc",5,4],["Barracks","crusader","crusader_barracks_mc",6,6],["Town","crusader","crusader_town_mc",5,7],["Headquarter","crusader","crusader_hq_mc",5,6],["Town","sarazen","sarazen_town_mc",8,7],["Barracks","sarazen","sarazen_barracks_mc",7,8],["Headquarter","sarazen","sarazen_hq_mc",8,8]],terrain:[[street,street,street,street,street,street,street,street,street,street,street,street,street,wood,wood],[street,river,river,river,river,river,river,river,river,river,river,river,street,street,wood],[street,street,street,street,street,street,street,street,street,street,street,river,river,street,wood],[wood,wood,wood,wood,ground,ground,ground,ground,ground,ground,street,street,river,street,wood],[wood,wood,wood,river,river,river,river,river,river,ground,ground,street,river,street,ground],[wood,ground,river,river,street,street,street,street,river,ground,ground,street,river,street,ground],[wood,ground,river,street,street,ground,street,river,river,ground,ground,street,river,street,ground],[ground,ground,river,street,ground,ground,river,river,street,ground,street,street,river,street,ground],[ground,swamp,river,street,ground,ground,river,street,street,street,street,river,river,street,wood],[swamp,swamp,river,street,ground,ground,river,river,river,river,river,river,hedgerows,street,wood],[swamp,swamp,river,street,ground,ground,ground,ground,ground,ground,ground,ground,hedgerows,street,wood],[hill,swamp,river,street,street,ground,ground,ground,ground,ground,ground,hedgerows,street,street,wood],[hill,hill,river,river,street,street,street,street,street,street,street,street,street,wood,wood],[hill,hill,hill,river,river,river,river,river,river,river,river,river,river,river,river],[hill,hill,hill,hill,hill,hill,ground,ground,ground,ground,wood,wood,wood,wood,river]]};
map_f_16 = {deckID:16,name:"f_16_10x10",bgModel:"f_16_10x10.swf",units:[],cities:[["Barracks","sarazen","sarazen_barracks_mc",7,6],["Village","sarazen","sarazen_village_mc",5,9],["Village","sarazen","sarazen_village_mc",1,9],["Town","sarazen","sarazen_town_mc",9,5],["Headquarter","sarazen","sarazen_hq_mc",9,9],["Village","crusader","crusader_village_mc",9,0],["Town","crusader","crusader_town_mc",0,4],["Barracks","crusader","crusader_barracks_mc",6,2],["Village","crusader","crusader_village_mc",8,1],["Headquarter","crusader","crusader_hq_mc",0,0]],terrain:[[street,street,street,street,street,hill,hill,ground,ground,ground],[street,ground,ground,ground,hill,hill,ground,ground,ground,ground],[street,ground,ground,ground,hill,hill,ground,ground,ground,ground],[street,ground,wood,ground,hill,ground,ground,wood,ground,ground],[street,wood,street,street,street,street,wood,ground,ground,ground],[street,ground,street,sea,sea,street,street,street,street,ground],[street,ground,street,ground,sea,sea,sea,ground,street,ground],[street,street,street,ground,sea,sea,street,street,street,ground],[ground,ground,ground,sea,sea,sea,street,ground,ground,ground],[ground,ground,ground,sea,ground,street,street,street,street,street]]};
map_f_17 = {deckID:17,name:"f_17_15x20",bgModel:"f_17_15x20.swf",units:[],cities:[["Factory","no","crusader_factory_mc",9,6],["Factory","no","sarazen_factory_mc",12,5],["Village","no","sarazen_village_mc",13,3],["Village","no","sarazen_village_mc",14,4],["Village","no","sarazen_village_mc",11,8],["Town","sarazen","sarazen_town_mc",15,11],["LightFactory","sarazen","sarazen_l-factory_mc",18,8],["Barracks","sarazen","sarazen_barracks_mc",14,13],["Town","sarazen","sarazen_town_mc",17,10],["Town","sarazen","sarazen_town_mc",16,12],["Headquarter","sarazen","sarazen_hq_mc",18,13],["Village","no","crusader_village_mc",10,6],["Village","no","crusader_village_mc",7,10],["Village","no","crusader_village_mc",4,12],["LightFactory","crusader","crusader_l-factory_mc",3,1],["Barracks","crusader","crusader_barracks_mc",4,0],["Town","crusader","crusader_town_mc",7,1],["Town","crusader","crusader_town_mc",2,4],["Town","crusader","crusader_town_mc",1,3],["Headquarter","crusader","crusader_hq_mc",1,1]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,sea,sea,sea,sea,sea,sea],[ground,street,street,street,ground,ground,street,street,street,street,ground,sea,ground,sea,sea],[ground,street,ground,street,street,street,street,ground,ground,street,ground,ground,ground,ground,sea],[ground,street,ground,ground,ground,ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[street,street,ground,ground,ground,ground,wood,wood,wood,street,ground,ground,ground,ground,ground],[street,ground,ground,ground,wood,wood,wood,wood,ground,street,ground,ground,ground,ground,ground],[street,ground,ground,wood,wood,ground,ground,ground,street,street,wood,wood,ground,ground,hill],[street,street,ground,wood,wood,wood,street,street,street,ground,ground,ground,ground,hill,hill],[ground,ground,ground,ground,hill,wood,street,wood,hill,hill,hill,hill,hill,hill,hill],[ground,ground,ground,hill,hill,ground,street,street,wood,hill,ground,ground,ground,ground,ground],[hill,hill,hill,hill,hill,hill,ground,street,ground,ground,hill,ground,ground,ground,ground],[ground,hill,hill,ground,hedgerows,street,street,street,ground,ground,hedgerows,ground,ground,ground,ground],[ground,hill,ground,ground,hedgerows,street,hedgerows,hedgerows,hedgerows,hedgerows,hedgerows,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,ground,hedgerows,hedgerows,hedgerows,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,ground,ground,ground,ground,ground,ground,street,street,ground],[ground,ground,ground,ground,ground,street,ground,ground,ground,ground,street,street,street,ground,ground],[ground,ground,ground,ground,street,street,ground,ground,ground,ground,street,ground,street,street,ground],[ground,ground,ground,ground,street,ground,ground,ground,ground,ground,street,ground,ground,street,ground],[ground,ground,ground,ground,street,street,street,ground,street,street,street,ground,ground,street,ground],[ground,ground,ground,ground,ground,ground,street,street,street,ground,ground,ground,ground,ground,ground]]};
map_f_18 = {deckID:18,name:"f_18_20x15",bgModel:"f_18_20x15.swf",units:[],cities:[["Airport","no","sarazen_airport_mc",9,7],["Airport","no","crusader_airport_mc",6,12],["LightFactory","no","crusader_l-factory_mc",11,18],["LightFactory","no","sarazen_l-factory_mc",2,1],["Village","no","sarazen_village_mc",5,1],["Village","no","sarazen_village_mc",8,6],["Village","no","sarazen_village_mc",9,5],["Town","no","sarazen_town_mc",8,3],["Town","no","sarazen_town_mc",7,5],["Village","no","crusader_village_mc",11,14],["Village","no","crusader_village_mc",9,15],["Village","no","crusader_village_mc",8,14],["Town","no","crusader_town_mc",8,12],["Town","no","crusader_town_mc",7,11],["Factory","no","crusader_factory_mc",4,8],["Factory","no","sarazen_factory_mc",11,10],["Barracks","sarazen","sarazen_barracks_mc",11,3],["Town","sarazen","sarazen_town_mc",12,1],["Headquarter","sarazen","sarazen_hq_mc",13,2],["Barracks","crusader","crusader_barracks_mc",4,17],["Town","crusader","crusader_town_mc",3,16],["Headquarter","crusader","crusader_hq_mc",1,17]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,wood,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,wood,wood,ground,ground,ground,ground,wood,wood,ground,ground,ground,ground,ground,street,street,ground,ground],[ground,street,street,street,street,street,street,ground,ground,ground,wood,wood,ground,ground,ground,ground,street,ground,ground,ground],[ground,street,wood,wood,ground,ground,street,street,street,street,street,wood,ground,ground,street,street,street,ground,ground,ground],[ground,street,street,ground,ground,ground,hill,ground,street,ground,street,wood,wood,wood,street,wood,street,street,ground,ground],[ground,ground,street,ground,hill,hill,hill,ground,ground,ground,street,wood,wood,wood,street,wood,wood,wood,ground,ground],[ground,ground,street,ground,ground,hill,hill,hill,ground,ground,street,street,street,street,street,ground,wood,ground,ground,ground],[ground,ground,street,ground,street,street,ground,hill,hill,ground,wood,street,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,street,street,street,ground,ground,wood,hill,hill,wood,street,street,street,street,street,street,street,street,ground],[ground,ground,wood,wood,street,ground,wood,street,street,hill,hill,ground,ground,ground,ground,ground,ground,ground,street,ground],[ground,wood,wood,wood,street,wood,wood,wood,street,street,hill,hill,hill,hill,wood,ground,ground,ground,street,ground],[wood,wood,street,street,street,ground,wood,wood,wood,street,street,hill,hill,wood,ground,ground,ground,ground,street,ground],[ground,street,street,ground,street,street,street,ground,ground,ground,street,ground,ground,ground,wood,street,street,street,street,ground],[ground,ground,street,ground,ground,ground,street,street,street,street,street,street,street,street,street,street,ground,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
map_f_19 = {deckID:19,name:"f_19_20x20",bgModel:"f_19_20x20.swf",units:[],cities:[["Village","no","sarazen_village_mc",18,17],["Village","no","crusader_village_mc",1,1],["Town","no","crusader_town_mc",5,5],["Town","no","crusader_town_mc",12,7],["Town","no","sarazen_town_mc",16,13],["Town","no","sarazen_town_mc",9,11],["Factory","no","sarazen_factory_mc",5,13],["LightFactory","no","sarazen_l-factory_mc",4,15],["Factory","no","crusader_factory_mc",15,5],["LightFactory","no","crusader_l-factory_mc",15,3],["Village","no","sarazen_village_mc",16,12],["Village","no","sarazen_village_mc",17,14],["Village","no","sarazen_village_mc",15,11],["Village","no","sarazen_village_mc",17,9],["Airport","no","sarazen_airport_mc",17,11],["Village","no","crusader_village_mc",1,10],["Village","no","crusader_village_mc",4,7],["Village","no","crusader_village_mc",4,6],["Village","no","crusader_village_mc",3,5],["Airport","no","crusader_airport_mc",2,7],["Barracks","crusader","crusader_barracks_mc",8,3],["Town","crusader","crusader_town_mc",10,2],["Town","crusader","crusader_town_mc",11,1],["Headquarter","crusader","crusader_hq_mc",8,1],["Barracks","sarazen","sarazen_barracks_mc",7,17],["Town","sarazen","sarazen_town_mc",12,16],["Town","sarazen","sarazen_town_mc",10,17],["Headquarter","sarazen","sarazen_hq_mc",9,18]],terrain:[[ground,ground,wood,wood,ground,ground,ground,hill,hill,ground,ground,ground,ground,sea,sea,ground,ground,ground,ground,ground],[ground,ground,wood,ground,ground,ground,ground,ground,hill,hill,ground,street,street,street,street,ground,ground,ground,ground,ground],[wood,wood,wood,ground,ground,ground,street,street,street,hill,street,street,sea,ground,street,street,street,street,street,ground],[wood,ground,ground,ground,ground,street,street,wood,street,street,street,ground,sea,hill,hill,hill,hill,ground,street,ground],[ground,ground,ground,ground,ground,street,ground,ground,wood,wood,ground,sea,sea,hill,street,street,street,street,street,ground],[sea,sea,ground,ground,ground,street,wood,wood,wood,wood,ground,sea,ground,street,street,wood,ground,ground,ground,ground],[ground,sea,sea,sea,sea,street,street,street,street,ground,sea,sea,ground,street,wood,ground,ground,ground,ground,ground],[ground,ground,ground,ground,sea,sea,sea,sea,street,ground,sea,street,street,street,street,street,street,street,street,ground],[ground,street,ground,street,street,street,street,street,street,sea,sea,street,ground,ground,wood,ground,ground,ground,street,ground],[ground,street,ground,street,ground,ground,ground,ground,sea,sea,ground,street,ground,ground,ground,wood,wood,wood,street,ground],[ground,street,street,street,ground,ground,ground,wood,wood,sea,ground,ground,ground,ground,wood,wood,street,street,street,ground],[ground,street,wood,wood,wood,wood,wood,wood,wood,sea,sea,wood,wood,wood,ground,wood,street,wood,wood,wood],[ground,street,ground,ground,wood,wood,ground,ground,ground,wood,sea,ground,ground,ground,ground,wood,street,ground,ground,ground],[ground,street,ground,ground,wood,hill,hill,hill,sea,sea,sea,sea,sea,sea,sea,ground,street,ground,ground,ground],[ground,street,wood,wood,wood,ground,ground,sea,sea,wood,ground,ground,ground,ground,sea,sea,street,street,street,street],[ground,street,wood,street,street,street,street,sea,hill,wood,ground,ground,ground,ground,ground,sea,sea,sea,sea,street],[ground,street,street,street,wood,ground,street,sea,hill,ground,wood,ground,ground,street,street,street,street,street,street,street],[ground,ground,ground,hill,ground,sea,street,street,hill,ground,wood,street,street,street,ground,ground,wood,wood,wood,wood],[ground,ground,hill,ground,ground,sea,ground,street,hill,wood,wood,wood,wood,street,ground,hill,wood,ground,wood,ground],[ground,hill,hill,ground,ground,sea,sea,street,street,street,street,street,street,street,hill,wood,wood,ground,ground,ground]]};
map_f_20 = {deckID:20,name:"f_20_30x10",bgModel:"f_20_30x10.swf",units:[],cities:[["Airport","no","sarazen_airport_mc",5,19],["Airport","no","crusader_airport_mc",3,12],["LightFactory","no","crusader_l-factory_mc",8,11],["LightFactory","no","sarazen_l-factory_mc",1,19],["Factory","no","sarazen_factory_mc",1,24],["Factory","no","crusader_factory_mc",7,7],["Village","no","sarazen_village_mc",0,22],["Village","no","crusader_village_mc",9,7],["Barracks","no","crusader_barracks_mc",2,13],["Town","no","crusader_town_mc",4,14],["Village","no","crusader_village_mc",5,13],["Village","no","crusader_village_mc",6,12],["Village","no","crusader_village_mc",7,13],["LightFactory","no","sarazen_l-factory_mc",7,16],["Town","no","sarazen_town_mc",2,18],["Village","no","sarazen_village_mc",4,18],["Village","no","sarazen_village_mc",3,17],["Village","no","sarazen_village_mc",2,17],["Barracks","sarazen","sarazen_barracks_mc",5,27],["Town","sarazen","sarazen_town_mc",6,28],["Town","sarazen","sarazen_town_mc",4,28],["Headquarter","sarazen","sarazen_hq_mc",7,26],["Barracks","crusader","crusader_barracks_mc",4,2],["Town","crusader","crusader_town_mc",2,5],["Town","crusader","crusader_town_mc",6,2],["Headquarter","crusader","crusader_hq_mc",2,3]],terrain:[[ground,ground,ground,ground,ground,street,street,street,ground,ground,ground,hill,hill,ground,ground,ground,ground,ground,hill,hill,hill,ground,ground,ground,ground,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,wood,street,ground,ground,hill,hill,ground,street,street,street,street,ground,ground,street,hill,hill,ground,ground,street,street,street,street,street,ground],[ground,ground,ground,street,street,street,wood,street,ground,hill,hill,ground,street,street,ground,hill,street,street,street,street,ground,hill,hill,ground,street,wood,ground,ground,street,ground],[ground,ground,ground,street,ground,ground,wood,street,hill,hill,ground,ground,street,ground,ground,hill,ground,ground,ground,street,ground,ground,hill,hill,street,wood,wood,ground,street,ground],[ground,street,street,street,ground,wood,wood,street,ground,hill,ground,ground,street,street,street,ground,hill,ground,ground,street,ground,street,street,street,street,wood,wood,ground,street,ground],[ground,street,ground,street,street,wood,wood,street,street,street,street,ground,ground,ground,street,hill,ground,ground,ground,street,street,street,ground,hill,street,wood,street,street,street,ground],[ground,street,street,ground,street,ground,wood,street,hill,ground,street,street,street,street,street,hill,ground,ground,ground,street,ground,ground,hill,hill,street,wood,street,ground,street,ground],[ground,ground,ground,ground,street,street,wood,street,hill,hill,ground,street,ground,ground,street,street,street,street,street,street,ground,hill,hill,ground,street,wood,street,ground,ground,ground],[ground,ground,ground,ground,ground,street,street,street,hill,hill,ground,street,ground,ground,hill,ground,ground,ground,ground,ground,hill,hill,ground,ground,street,wood,street,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,hill,hill,ground,ground,ground,hill,hill,ground,ground,ground,hill,hill,ground,ground,ground,street,street,street,ground,ground,ground]]};
map_f_99 = {deckID:99,name:"f_99_20x20",bgModel:"20x20_01.swf",units:[["FlyingUnit","sarazen_flightunit_mc",1,11,"sarazen",10],["Trebuchet","sarazen_trebuchet_mc",10,2,"sarazen",10],["Spearman","sarazen_spearman_mc",9,4,"sarazen",10],["LightCavalry","sarazen_l-cavalry_mc",3,9,"sarazen",10],["Archer","sarazen_archer_mc",4,13,"sarazen",10],["Swordsman","sarazen_swordsman_mc",5,11,"sarazen",10],["Spearman","sarazen_spearman_mc",9,10,"sarazen",10],["Guard","sarazen_guard_mc",13,8,"sarazen",5],["FlyingUnit","sarazen_flightunit_mc",12,18,"sarazen",10],["HeavyCavalry","sarazen_h-cavalry_mc",6,16,"sarazen",10],["LightCavalry","sarazen_l-cavalry_mc",9,16,"sarazen",10],["BowCavalry","sarazen_b-cavalry_mc",14,14,"sarazen",10],["LightCavalry","sarazen_l-cavalry_mc",11,7,"sarazen",10],["Ship","sarazen_ship_mc",18,13,"sarazen",10],["Ship","crusader_ship_mc",18,18,"crusader",10],["Ship","crusader_ship_mc",18,15,"crusader",10],["Ship","crusader_ship_mc",17,17,"crusader",10],["Ballista","crusader_ballista_mc",14,16,"crusader",10],["SiegeTower","crusader_tower_mc",15,13,"crusader",12],["Catapult","crusader_catapult_mc",11,11,"crusader",10],["Trebuchet","crusader_trebuchet_mc",8,12,"crusader",10],["Swordsman","crusader_swordsman_mc",4,10,"crusader",10],["Spearman","crusader_spearman_mc",4,6,"crusader",10],["Archer","crusader_archer_mc",6,5,"crusader",10],["FlyingUnit","crusader_flightunit_mc",13,3,"crusader",10],["HeavyCavalry","crusader_h-cavalry_mc",11,5,"crusader",10],["BowCavalry","crusader_b-cavalry_mc",8,14,"crusader",10],["LightCavalry","crusader_l-cavalry_mc",9,11,"crusader",10],["Swordsman","crusader_swordsman_mc",4,15,"crusader",10],["Guard","crusader_guard_mc",3,7,"crusader",5]],cities:[["Village","no","sarazen_village_mc",15,6],["Town","no","crusader_town_mc",9,3],["Town","no","sarazen_town_mc",18,8],["Village","no","crusader_village_mc",12,3],["Airport","no","crusader_airport_mc",14,4],["Barracks","no","sarazen_barracks_mc",15,8],["Village","no","sarazen_village_mc",13,9],["Village","no","crusader_village_mc",7,8],["Town","no","crusader_town_mc",5,9],["Town","no","crusader_town_mc",8,7],["Town","no","crusader_town_mc",6,6],["Town","no","crusader_town_mc",5,3],["Village","no","sarazen_village_mc",17,13],["Town","no","sarazen_town_mc",14,12],["Town","no","sarazen_town_mc",16,11],["Barracks","sarazen","sarazen_barracks_mc",15,15],["Headquarter","sarazen","sarazen_hq_mc",15,14],["Harbour","sarazen","sarazen_harbour_mc",16,16],["Town","sarazen","sarazen_town_mc",16,14],["Town","sarazen","sarazen_town_mc",16,15],["LightFactory","no","sarazen_l-factory_mc",14,17],["Airport","no","sarazen_airport_mc",13,18],["Town","no","sarazen_town_mc",12,12],["Village","no","sarazen_village_mc",11,15],["Factory","no","sarazen_factory_mc",10,13],["Factory","no","crusader_factory_mc",7,10],["Village","no","crusader_village_mc",6,12],["Village","no","sarazen_village_mc",10,17],["Town","no","sarazen_town_mc",9,18],["Town","no","sarazen_town_mc",8,17],["Town","no","sarazen_town_mc",6,16],["Village","no","sarazen_village_mc",6,18],["Town","no","crusader_town_mc",3,17],["Town","no","crusader_town_mc",2,13],["Village","no","crusader_village_mc",2,11],["LightFactory","no","crusader_l-factory_mc",1,8],["Town","crusader","crusader_town_mc",3,4],["Barracks","crusader","crusader_barracks_mc",2,6],["Headquarter","crusader","crusader_hq_mc",2,5]],terrain:[[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,hill,ground,ground,street,street,ground,hedgerows,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,street,street,street,ground,ground,street,ground,ground,hedgerows,street,street,hill,hill,hill,sea,sea],[sea,sea,sea,sea,street,hill,street,street,street,street,street,street,ground,hedgerows,street,street,street,street,sea,sea],[sea,sea,ground,ground,hill,street,street,hill,ground,ground,ground,street,hedgerows,street,street,street,hill,hill,sea,sea],[sea,sea,wood,street,street,street,hill,hill,hill,street,street,street,street,street,hill,street,ground,ground,sea,sea],[sea,sea,wood,wood,wood,street,street,ground,hill,hill,street,ground,ground,street,hill,street,street,hedgerows,ground,sea],[sea,sea,wood,wood,wood,wood,wood,wood,ground,river,street,street,street,street,hill,street,ground,hedgerows,hedgerows,sea],[sea,sea,swamp,ground,wood,ground,wood,street,river,river,river,street,ground,hill,ground,street,ground,street,hedgerows,sea],[sea,swamp,swamp,street,ground,ground,street,street,river,river,street,street,hill,hill,street,street,street,street,street,sea],[sea,ground,ground,street,ground,ground,street,river,river,street,street,hill,ground,street,street,wood,street,ground,sea,sea],[sea,ground,ground,street,street,street,street,street,street,street,hill,ground,ground,wood,wood,ground,street,wood,sea,sea],[sea,sea,ground,ground,ground,street,river,swamp,street,hill,hill,ground,street,street,wood,wood,street,wood,sea,sea],[sea,sea,ground,ground,street,street,river,swamp,street,ground,wood,wood,ground,street,street,street,street,street,street,sea],[sea,sea,sea,ground,street,ground,river,hill,street,street,street,street,street,ground,ground,street,ground,street,sea,sea],[sea,sea,sea,swamp,river,river,ground,hill,street,wood,street,street,wood,ground,street,street,ground,sea,sea,sea],[sea,sea,sea,swamp,river,hill,hill,hill,hill,wood,wood,street,ground,ground,street,street,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,hill,street,street,street,street,ground,ground,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,sea,street,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea]]};
k_01_10x10 = {name:"k_01_10x10",bgModel:"k_01_10x10.swf",units:[["Guard","undefined",8,8,"sarazen",5],["Swordsman","undefined",5,6,"sarazen",10],["Spearman","undefined",6,7,"sarazen",10],["Archer","undefined",5,8,"sarazen",10],["LightCavalry","undefined",1,5,"crusader",10],["Archer","undefined",1,1,"crusader",10],["Guard","undefined",1,3,"crusader",5],["Spearman","undefined",6,3,"crusader",10],["Swordsman","undefined",4,3,"crusader",10],["Swordsman","undefined",2,2,"crusader",10]],cities:[["Village","crusader","crusader_village_mc",7,1],["Town","crusader","crusader_town_mc",2,4],["Town","crusader","crusader_town_mc",4,2],["Town","crusader","crusader_town_mc",3,1],["Town","sarazen","sarazen_town_mc",7,6],["Village","sarazen","sarazen_village_mc",6,8],["Village","sarazen","sarazen_village_mc",3,7],["Headquarter","sarazen","sarazen_hq_mc",8,7],["Headquarter","crusader","crusader_hq_mc",1,2]],terrain:[[wood,street,wood,ground,sea,sea,sea,sea,ground,ground],[wood,street,street,street,street,ground,sea,hedgerows,ground,ground],[ground,ground,street,ground,street,hedgerows,hill,hedgerows,ground,ground],[hill,street,street,ground,ground,hill,ground,ground,ground,ground],[hill,ground,street,ground,ground,hill,wood,ground,ground,ground],[ground,ground,street,street,ground,wood,ground,ground,street,street],[ground,ground,wood,street,hill,hill,ground,ground,street,ground],[ground,ground,wood,street,street,street,street,street,street,ground],[ground,ground,wood,wood,ground,ground,ground,street,ground,ground],[ground,ground,wood,ground,ground,ground,ground,street,ground,ground]]};
k_02_10x20 = {name:"k_02_10x20",bgModel:"k_02_10x20.swf",units:[["Catapult","undefined",2,6,"sarazen",10],["Catapult","undefined",2,3,"sarazen",10],["HeavyCavalry","undefined",0,8,"sarazen",12],["HeavyCavalry","undefined",3,2,"sarazen",12],["LightCavalry","undefined",1,2,"sarazen",10],["LightCavalry","undefined",0,3,"sarazen",10],["Archer","undefined",1,0,"sarazen",10],["Catapult","undefined",16,6,"crusader",10],["LightCavalry","undefined",19,6,"crusader",10],["Archer","undefined",14,6,"crusader",10],["Archer","undefined",15,8,"crusader",10],["Spearman","undefined",18,5,"crusader",10],["Swordsman","undefined",16,8,"crusader",10],["Swordsman","undefined",16,3,"crusader",10]],cities:[["LightFactory","no","crusader_l-factory_mc",13,2],["LightFactory","no","sarazen_l-factory_mc",6,4],["Barracks","no","crusader_barracks_mc",16,1],["Factory","no","crusader_factory_mc",11,8],["Barracks","sarazen","sarazen_barracks_mc",0,2],["Factory","sarazen","sarazen_factory_mc",4,1],["Town","sarazen","sarazen_town_mc",2,4],["Village","sarazen","sarazen_village_mc",0,7],["Village","sarazen","sarazen_village_mc",1,5],["Village","crusader","crusader_village_mc",18,2],["Town","crusader","crusader_town_mc",15,7],["Town","crusader","crusader_town_mc",16,5],["Town","crusader","crusader_town_mc",15,6],["Headquarter","crusader","crusader_hq_mc",17,6],["Headquarter","sarazen","sarazen_hq_mc",1,1]],terrain:[[ground,street,street,street,ground,ground,ground,ground,ground,sea],[street,street,ground,street,ground,ground,ground,ground,ground,sea],[street,ground,ground,street,street,street,street,street,sea,sea],[street,street,ground,ground,ground,ground,ground,street,sea,sea],[ground,street,ground,ground,ground,ground,ground,street,ground,sea],[ground,street,street,street,street,ground,wood,street,street,ground],[ground,hill,hill,ground,street,wood,wood,wood,street,ground],[ground,ground,hill,hill,street,wood,ground,street,street,river],[ground,ground,ground,street,street,ground,ground,street,river,ground],[ground,ground,ground,street,ground,river,river,street,ground,ground],[ground,ground,ground,street,river,ground,ground,street,ground,ground],[ground,river,river,street,street,wood,ground,street,street,street],[river,hill,hill,hill,street,wood,hill,ground,street,ground],[hill,ground,street,street,street,hill,ground,ground,street,ground],[ground,street,street,wood,hill,hill,ground,ground,street,ground],[ground,street,wood,ground,ground,ground,street,street,street,ground],[ground,street,street,street,street,street,street,ground,ground,wood],[ground,ground,hill,ground,ground,ground,street,ground,wood,wood],[ground,ground,ground,ground,hill,ground,street,ground,hill,wood],[ground,ground,ground,ground,hill,hill,street,hill,hill,wood]]};
k_03_20x10 = {name:"k_03_20x10",bgModel:"k_03_20x10.swf",units:[["Ballista","undefined",6,17,"sarazen",10],["Catapult","undefined",3,19,"sarazen",10],["Catapult","undefined",5,17,"sarazen",10],["Archer","undefined",4,19,"sarazen",10],["Archer","undefined",8,18,"sarazen",10],["Archer","undefined",6,16,"sarazen",10],["HeavyCavalry","undefined",0,1,"crusader",12],["BowCavalry","undefined",2,1,"crusader",10],["LightCavalry","undefined",0,3,"crusader",10],["LightCavalry","undefined",3,1,"crusader",10],["Swordsman","undefined",2,4,"crusader",10]],cities:[["LightFactory","no","sarazen_l-factory_mc",0,14],["LightFactory","no","crusader_l-factory_mc",7,2],["Town","sarazen","sarazen_town_mc",1,17],["Barracks","sarazen","crusader_barracks_mc",4,18],["Factory","sarazen","sarazen_factory_mc",5,16],["Barracks","no","crusader_barracks_mc",1,9],["Factory","no","crusader_factory_mc",3,7],["Factory","no","sarazen_factory_mc",5,13],["Barracks","crusader","crusader_barracks_mc",2,3],["Factory","crusader","crusader_factory_mc",3,0],["Town","no","sarazen_town_mc",8,7],["Town","no","sarazen_town_mc",6,11],["Town","no","crusader_town_mc",2,6],["Village","no","crusader_village_mc",0,10],["Village","no","crusader_village_mc",4,2],["Village","no","sarazen_village_mc",7,10],["Town","crusader","crusader_town_mc",0,4],["Village","sarazen","sarazen_village_mc",6,14],["Village","sarazen","sarazen_village_mc",7,16],["Headquarter","crusader","crusader_hq_mc",1,2],["Headquarter","sarazen","sarazen_hq_mc",5,18]],terrain:[[wood,wood,wood,street,street,wood,wood,ground,ground,ground,ground,hedgerows,ground,street,street,street,ground,ground,ground,ground],[street,street,street,street,ground,wood,ground,street,street,street,street,wood,ground,street,ground,street,street,street,street,street],[street,ground,ground,street,street,street,street,street,hill,hedgerows,street,wood,ground,street,ground,ground,ground,ground,ground,street],[street,street,ground,hill,hill,ground,ground,street,hill,ground,street,street,street,street,ground,ground,ground,ground,street,street],[ground,street,ground,hill,wood,ground,ground,hill,hill,hill,ground,ground,ground,ground,ground,hedgerows,hedgerows,ground,street,ground],[street,street,ground,wood,ground,ground,hill,hedgerows,ground,hill,hill,hill,hill,street,ground,hedgerows,street,street,street,ground],[street,ground,ground,wood,ground,ground,ground,ground,ground,ground,hill,street,street,street,street,street,street,ground,ground,ground],[street,street,street,hill,ground,ground,ground,ground,ground,hedgerows,ground,street,swamp,swamp,hedgerows,hedgerows,ground,ground,ground,ground],[ground,ground,street,hill,street,street,street,street,swamp,hedgerows,street,street,ground,sea,sea,hedgerows,ground,ground,ground,ground],[ground,ground,street,street,street,hill,hill,street,street,street,street,sea,sea,sea,sea,sea,hedgerows,sea,hedgerows,ground]]};
k_04_20x20 = {name:"k_04_20x20",bgModel:"k_04_20x20.swf",units:[["BowCavalry","undefined",15,16,"sarazen",10],["Catapult","undefined",15,18,"sarazen",10],["HeavyCavalry","undefined",18,18,"sarazen",12],["LightCavalry","undefined",17,15,"sarazen",10],["Archer","undefined",17,17,"sarazen",10],["Archer","undefined",10,15,"sarazen",10],["Archer","undefined",14,17,"sarazen",10],["Guard","undefined",1,4,"crusader",5],["BowCavalry","undefined",7,6,"crusader",10],["LightCavalry","undefined",1,5,"crusader",10],["Spearman","undefined",6,4,"crusader",10],["Spearman","undefined",8,1,"crusader",10],["Swordsman","undefined",3,2,"crusader",10]],cities:[["Harbour","crusader","crusader_harbour_mc",13,2],["LightFactory","no","crusader_l-factory_mc",11,3],["LightFactory","no","sarazen_l-factory_mc",15,11],["Barracks","sarazen","sarazen_barracks_mc",17,16],["Factory","sarazen","sarazen_factory_mc",13,17],["Barracks","crusader","crusader_barracks_mc",1,2],["Barracks","crusader","crusader_barracks_mc",6,1],["Factory","crusader","crusader_factory_mc",3,0],["Barracks","no","sarazen_barracks_mc",14,14],["Barracks","no","crusader_barracks_mc",6,5],["Harbour","no","sarazen_harbour_mc",15,9],["Harbour","crusader","crusader_harbour_mc",10,2],["Town","no","sarazen_town_mc",2,18],["Village","no","sarazen_village_mc",4,13],["Town","no","sarazen_town_mc",3,16],["Town","no","sarazen_town_mc",5,17],["Village","no","sarazen_village_mc",3,19],["Village","no","sarazen_village_mc",0,18],["Town","crusader","crusader_town_mc",6,2],["Town","crusader","crusader_town_mc",1,4],["Village","sarazen","sarazen_village_mc",13,13],["Headquarter","sarazen","sarazen_hq_mc",17,18],["Town","sarazen","sarazen_town_mc",10,16],["Town","sarazen","sarazen_town_mc",18,17],["Town","sarazen","sarazen_town_mc",12,19],["Town","sarazen","sarazen_town_mc",14,18],["Village","sarazen","sarazen_village_mc",16,18],["Town","crusader","crusader_town_mc",1,0],["Village","crusader","crusader_village_mc",4,3],["Village","crusader","crusader_village_mc",2,1],["Headquarter","crusader","crusader_hq_mc",7,1]],terrain:[[ground,ground,ground,wood,wood,wood,ground,wood,ground,ground,street,street,street,ground,ground,ground,hedgerows,hedgerows,ground,ground],[street,street,street,street,street,street,street,wood,wood,ground,street,wood,street,street,street,ground,ground,hedgerows,hedgerows,ground],[street,ground,ground,ground,ground,ground,street,street,street,wood,street,wood,ground,ground,street,ground,street,street,street,ground],[street,street,street,ground,ground,ground,ground,hill,street,wood,street,wood,wood,ground,street,street,street,ground,street,ground],[wood,ground,street,ground,ground,ground,ground,hill,street,street,street,ground,wood,ground,hedgerows,ground,ground,ground,street,ground],[wood,wood,street,ground,ground,ground,ground,hill,hill,ground,ground,ground,wood,wood,ground,ground,ground,street,street,ground],[wood,street,street,street,street,street,ground,ground,ground,hill,ground,ground,ground,ground,ground,ground,ground,street,ground,ground],[ground,street,ground,ground,ground,street,ground,wood,ground,ground,ground,hill,hill,hill,ground,ground,street,street,ground,ground],[ground,street,street,street,ground,street,ground,wood,hill,ground,ground,hill,street,street,street,street,street,ground,ground,ground],[ground,ground,hedgerows,street,ground,street,ground,ground,hill,ground,ground,hill,street,ground,ground,ground,ground,ground,ground,ground],[ground,sea,sea,street,ground,street,hill,hill,ground,ground,hill,ground,street,street,street,street,street,street,ground,ground],[sea,sea,sea,street,street,street,ground,swamp,ground,ground,ground,ground,ground,ground,ground,ground,ground,street,ground,ground],[sea,ground,hedgerows,hedgerows,street,hill,swamp,swamp,ground,ground,ground,ground,hill,hill,ground,ground,ground,street,street,street],[sea,sea,sea,ground,street,street,street,street,hedgerows,hedgerows,swamp,hedgerows,hill,ground,ground,ground,ground,street,ground,ground],[sea,sea,sea,sea,sea,ground,hedgerows,street,street,street,street,hill,hedgerows,street,street,street,street,street,street,street],[sea,sea,sea,sea,sea,sea,ground,ground,sea,sea,street,street,street,street,ground,ground,ground,ground,ground,street],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,hedgerows,sea,sea,street,street,street,ground,ground,ground,street],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,street,street,street,street,street],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,street,ground,ground],[sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,street,ground,ground]]};
k_05_20x20 = {name:"k_05_20x20",bgModel:"k_05_20x20.swf",units:[["Catapult","undefined",9,17,"sarazen",10],["HeavyCavalry","undefined",16,14,"sarazen",12],["LightCavalry","undefined",17,16,"sarazen",10],["Archer","undefined",13,12,"sarazen",10],["Spearman","undefined",15,13,"sarazen",10],["Swordsman","undefined",14,14,"sarazen",10],["BowCavalry","undefined",9,13,"sarazen",10],["HeavyCavalry","undefined",10,6,"crusader",12],["LightCavalry","undefined",11,1,"crusader",10],["Archer","undefined",14,3,"crusader",10],["Spearman","undefined",9,1,"crusader",10],["Swordsman","undefined",12,3,"crusader",10],["Swordsman","undefined",13,1,"crusader",10]],cities:[["Town","crusader","crusader_town_mc",12,1],["Town","crusader","crusader_town_mc",7,2],["Village","crusader","crusader_village_mc",1,1],["Village","crusader","crusader_village_mc",16,0],["Town","sarazen","sarazen_town_mc",14,13],["Town","sarazen","sarazen_town_mc",9,15],["Town","sarazen","sarazen_town_mc",15,17],["Village","sarazen","sarazen_village_mc",17,17],["Village","sarazen","sarazen_village_mc",4,18],["Village","sarazen","sarazen_village_mc",1,17],["LightFactory","no","crusader_l-factory_mc",15,4],["LightFactory","no","sarazen_l-factory_mc",12,12],["Barracks","no","sarazen_barracks_mc",15,15],["Barracks","no","crusader_barracks_mc",14,2],["Factory","no","sarazen_factory_mc",10,17],["Factory","no","crusader_factory_mc",9,3],["Village","no","sarazen_village_mc",8,11],["Village","no","crusader_village_mc",7,6],["Town","no","sarazen_town_mc",0,12],["Town","no","sarazen_town_mc",2,14],["Town","no","crusader_town_mc",0,4],["Airport","no","sarazen_airport_mc",3,13],["Airport","no","crusader_airport_mc",2,7],["Airport","no","crusader_airport_mc",0,6],["Headquarter","crusader","crusader_hq_mc",12,2],["Headquarter","sarazen","sarazen_hq_mc",14,17]],terrain:[[ground,ground,ground,river,street,street,street,street,wood,ground,ground,street,street,street,street,street,street,ground,ground,ground],[ground,ground,ground,river,ground,street,ground,street,wood,wood,ground,street,ground,ground,ground,ground,street,ground,ground,ground],[ground,ground,ground,ground,street,street,ground,street,street,street,wood,street,ground,street,street,street,street,ground,ground,ground],[ground,ground,ground,ground,street,river,river,wood,hill,street,street,street,hedgerows,street,ground,hedgerows,hedgerows,river,river,ground],[ground,ground,street,street,street,hedgerows,hedgerows,river,hill,wood,ground,hill,street,street,ground,river,river,ground,ground,river],[ground,ground,street,ground,ground,ground,ground,river,ground,hill,hill,river,street,river,river,ground,ground,ground,ground,ground],[ground,ground,street,ground,ground,wood,wood,ground,river,ground,river,ground,street,street,ground,ground,ground,ground,ground,ground],[wood,ground,street,street,ground,ground,ground,ground,ground,river,ground,wood,wood,street,ground,ground,ground,ground,ground,ground],[wood,wood,wood,street,ground,wood,ground,sea,sea,river,ground,ground,wood,street,ground,ground,ground,hill,hill,ground],[wood,street,street,street,wood,wood,ground,hedgerows,sea,sea,swamp,ground,ground,street,street,street,hill,ground,ground,ground],[wood,street,hedgerows,hedgerows,ground,ground,ground,hedgerows,sea,sea,sea,swamp,ground,ground,hill,street,street,street,ground,ground],[ground,street,hill,hill,hill,ground,ground,ground,sea,sea,sea,hill,hill,hill,hill,street,ground,ground,ground,ground],[ground,street,street,street,hill,ground,ground,sea,sea,sea,sea,hill,street,street,hill,street,street,street,ground,ground],[ground,ground,ground,street,hill,ground,hill,sea,sea,sea,sea,hill,street,ground,hill,hill,ground,street,ground,ground],[ground,ground,street,street,hill,hill,hill,hill,sea,sea,sea,hill,street,street,ground,ground,ground,street,ground,ground],[ground,ground,street,hill,street,hill,hill,sea,sea,sea,sea,sea,ground,street,street,street,street,street,ground,ground],[ground,ground,street,street,street,ground,hill,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground,ground],[ground,wood,wood,ground,swamp,ground,hill,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground,ground],[ground,ground,wood,wood,swamp,swamp,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground],[ground,ground,ground,sea,wood,sea,sea,sea,sea,sea,sea,sea,sea,sea,ground,ground,ground,ground,ground,ground]]};
k_06_10x30 = {name:"k_06_10x30",bgModel:"k_06_10x30.swf",units:[["Ballista","undefined",26,6,"sarazen",10],["Catapult","undefined",26,4,"sarazen",10],["HeavyCavalry","undefined",25,8,"sarazen",12],["LightCavalry","undefined",28,7,"sarazen",10],["FlyingUnit","undefined",25,5,"sarazen",10],["Archer","undefined",26,3,"sarazen",10],["Spearman","undefined",27,5,"sarazen",10],["Swordsman","undefined",28,3,"sarazen",10],["Ballista","undefined",2,4,"crusader",10],["Catapult","undefined",4,1,"crusader",10],["HeavyCavalry","undefined",5,0,"crusader",12],["LightCavalry","undefined",1,1,"crusader",10],["Archer","undefined",6,5,"crusader",10],["Spearman","undefined",3,6,"crusader",10],["Swordsman","undefined",3,0,"crusader",10]],cities:[["LightFactory","no","crusader_l-factory_mc",2,6],["LightFactory","no","sarazen_l-factory_mc",28,1],["Barracks","no","crusader_barracks_mc",5,7],["Barracks","no","sarazen_barracks_mc",26,5],["Factory","no","sarazen_factory_mc",22,3],["Factory","no","crusader_factory_mc",6,2],["Airport","no","crusader_airport_mc",11,5],["Airport","no","sarazen_airport_mc",16,5],["Town","no","crusader_town_mc",13,1],["Town","no","crusader_town_mc",12,2],["Town","no","sarazen_town_mc",25,4],["Town","no","sarazen_town_mc",18,7],["Town","sarazen","sarazen_town_mc",24,1],["Town","sarazen","sarazen_town_mc",19,6],["Town","sarazen","sarazen_town_mc",27,4],["Village","sarazen","sarazen_village_mc",19,1],["Village","sarazen","sarazen_village_mc",27,7],["Village","sarazen","sarazen_village_mc",16,8],["Town","crusader","crusader_town_mc",7,7],["Town","crusader","crusader_town_mc",3,2],["Village","crusader","crusader_village_mc",10,1],["Headquarter","crusader","crusader_hq_mc",4,5],["Headquarter","sarazen","sarazen_hq_mc",26,2]],terrain:[[wood,wood,sea,sea,sea,sea,sea,sea,sea,sea],[wood,wood,ground,sea,sea,sea,hedgerows,hedgerows,sea,sea],[ground,wood,street,street,street,street,street,ground,ground,sea],[ground,street,street,wood,wood,ground,street,ground,sea,sea],[ground,street,wood,wood,ground,street,street,street,sea,sea],[ground,street,street,ground,wood,wood,ground,street,ground,sea],[ground,ground,street,ground,ground,ground,ground,street,ground,ground],[street,street,street,hill,ground,ground,ground,street,street,street],[street,ground,hill,ground,hill,ground,ground,hill,hill,street],[street,ground,wood,ground,hill,ground,hill,ground,street,street],[street,ground,wood,ground,hill,street,street,street,street,ground],[street,wood,wood,wood,hill,street,wood,street,ground,river],[street,ground,street,street,street,hill,wood,street,river,ground],[street,street,street,wood,street,ground,river,street,swamp,ground],[ground,ground,ground,river,street,river,street,street,swamp,hedgerows],[ground,ground,river,street,street,hill,street,hedgerows,hedgerows,swamp],[river,river,hedgerows,street,hill,street,street,ground,ground,swamp],[hedgerows,hedgerows,street,street,hill,street,hedgerows,hedgerows,ground,swamp],[street,street,street,hedgerows,hill,street,street,street,ground,ground],[street,ground,hedgerows,ground,ground,hill,street,ground,ground,ground],[street,ground,ground,ground,ground,hill,street,ground,ground,ground],[street,street,hill,hill,hill,hill,street,street,street,ground],[ground,street,street,street,ground,ground,ground,ground,street,ground],[ground,street,ground,street,ground,ground,ground,street,street,ground],[ground,street,ground,hill,hill,hill,street,street,hill,ground],[ground,street,hill,ground,street,ground,street,hill,ground,ground],[ground,street,street,street,street,street,street,ground,ground,ground],[ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[ground,street,street,street,street,ground,ground,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
k_07_30x10 = {name:"k_07_30x10",bgModel:"k_07_30x10.swf",units:[["BowCavalry","undefined",2,24,"sarazen",10],["Trebuchet","undefined",8,23,"sarazen",10],["Catapult","undefined",6,27,"sarazen",10],["HeavyCavalry","undefined",8,27,"sarazen",12],["LightCavalry","undefined",1,28,"sarazen",10],["Archer","undefined",7,28,"sarazen",10],["Spearman","undefined",4,24,"sarazen",10],["Spearman","undefined",8,22,"sarazen",10],["Swordsman","undefined",7,25,"sarazen",10],["BowCavalry","undefined",3,7,"crusader",10],["Catapult","undefined",0,8,"crusader",10],["HeavyCavalry","undefined",0,12,"crusader",12],["LightCavalry","undefined",1,7,"crusader",10],["Archer","undefined",8,5,"crusader",10],["Spearman","undefined",2,4,"crusader",10],["Spearman","undefined",1,1,"crusader",10],["Swordsman","undefined",7,1,"crusader",10]],cities:[["Headquarter","sarazen","sarazen_hq_mc",6,25],["LightFactory","no","crusader_l-factory_mc",4,11],["Barracks","no","sarazen_barracks_mc",5,22],["Barracks","no","crusader_barracks_mc",2,9],["Factory","no","crusader_factory_mc",1,15],["Factory","no","sarazen_factory_mc",4,17],["Headquarter","crusader","crusader_hq_mc",2,3],["Factory","crusader","crusader_factory_mc",1,5],["Airport","no","crusader_airport_mc",7,14],["Airport","sarazen","sarazen_airport_mc",1,20],["Town","sarazen","sarazen_town_mc",6,18],["Town","sarazen","sarazen_town_mc",3,27],["Town","sarazen","sarazen_town_mc",7,24],["Village","sarazen","sarazen_village_mc",1,26],["Village","sarazen","sarazen_village_mc",2,23],["Town","crusader","crusader_town_mc",5,10],["Village","crusader","crusader_village_mc",8,6]],terrain:[[sea,sea,ground,ground,ground,ground,ground,street,street,street,ground,ground,ground,ground,ground,ground,hill,ground,ground,ground,ground,street,street,street,street,ground,ground,ground,ground,ground],[sea,ground,ground,ground,street,street,street,street,ground,street,ground,ground,street,street,street,street,hill,ground,street,street,street,street,ground,ground,street,ground,ground,ground,ground,ground],[sea,sea,street,street,street,ground,ground,ground,ground,street,ground,street,street,wood,ground,hill,ground,street,street,ground,ground,ground,ground,ground,street,ground,ground,ground,ground,ground],[sea,sea,ground,ground,ground,ground,wood,ground,ground,street,street,street,ground,ground,wood,hill,ground,street,ground,hill,ground,ground,ground,hill,street,street,street,street,ground,ground],[sea,ground,ground,ground,ground,wood,sea,sea,ground,ground,ground,street,street,street,street,ground,ground,street,ground,ground,hill,ground,ground,hill,ground,ground,ground,street,ground,ground],[sea,ground,ground,ground,swamp,sea,sea,sea,ground,ground,street,street,ground,hill,street,street,street,street,ground,ground,hill,street,street,hill,ground,street,street,street,ground,ground],[ground,ground,ground,ground,swamp,swamp,sea,wood,ground,ground,street,ground,hill,ground,hill,hill,ground,street,street,street,street,street,hill,ground,hill,street,ground,ground,ground,ground],[ground,ground,ground,swamp,ground,ground,wood,wood,wood,ground,street,street,street,street,street,wood,hill,ground,ground,ground,ground,street,hill,street,street,street,hedgerows,hedgerows,ground,ground],[ground,ground,ground,ground,ground,ground,ground,wood,wood,ground,hill,hill,ground,ground,wood,wood,ground,hill,wood,wood,swamp,street,ground,street,ground,hedgerows,hedgerows,ground,ground,ground],[ground,ground,ground,ground,ground,ground,ground,hedgerows,ground,hill,hill,ground,ground,ground,ground,ground,ground,ground,swamp,swamp,swamp,street,street,street,ground,ground,ground,ground,ground,ground]]};
k_08_15x15 = {name:"k_08_15x15",bgModel:"k_08_15x15.swf",units:[["Swordsman","undefined",3,1,"sarazen",10],["Swordsman","undefined",4,0,"sarazen",10],["Swordsman","undefined",5,1,"sarazen",10],["Guard","undefined",0,12,"crusader",5],["Guard","undefined",3,12,"crusader",5],["Guard","undefined",2,8,"crusader",5],["HeavyCavalry","undefined",0,6,"crusader",12],["LightCavalry","undefined",0,11,"crusader",10],["Archer","undefined",4,8,"crusader",10],["Archer","undefined",5,4,"crusader",10],["BowCavalry","undefined",14,9,"sarazen",10],["Catapult","undefined",14,8,"sarazen",10],["HeavyCavalry","undefined",13,4,"sarazen",12],["LightCavalry","undefined",13,13,"sarazen",10],["Archer","undefined",13,6,"sarazen",10],["Spearman","undefined",10,4,"sarazen",10]],cities:[["Barracks","no","crusader_barracks_mc",5,8],["Barracks","no","sarazen_barracks_mc",11,1],["Barracks","no","crusader_barracks_mc",7,0],["Factory","no","crusader_factory_mc",7,1],["Factory","no","crusader_factory_mc",5,11],["Factory","no","sarazen_factory_mc",7,11],["LightFactory","sarazen","sarazen_l-factory_mc",14,5],["Barracks","sarazen","sarazen_barracks_mc",13,9],["Factory","sarazen","sarazen_factory_mc",8,9],["LightFactory","crusader","crusader_l-factory_mc",1,8],["Factory","crusader","crusader_factory_mc",4,4],["Airport","no","crusader_airport_mc",5,7],["Airport","sarazen","sarazen_airport_mc",9,6],["Village","no","sarazen_village_mc",6,14],["Village","no","sarazen_village_mc",5,13],["Village","no","crusader_village_mc",8,0],["Town","crusader","crusader_town_mc",0,9],["Town","crusader","crusader_town_mc",6,6],["Town","sarazen","sarazen_town_mc",13,1],["Town","sarazen","sarazen_town_mc",8,7],["Village","sarazen","sarazen_village_mc",9,12],["Village","sarazen","sarazen_village_mc",12,11],["Village","crusader","crusader_village_mc",1,1],["Headquarter","sarazen","sarazen_hq_mc",12,4],["Headquarter","crusader","crusader_hq_mc",1,12]],terrain:[[ground,ground,ground,ground,ground,ground,ground,ground,ground,street,street,street,street,ground,ground],[ground,ground,wood,wood,wood,wood,wood,ground,street,street,ground,ground,street,ground,ground],[wood,wood,wood,ground,ground,wood,wood,wood,street,ground,ground,ground,ground,ground,hedgerows],[ground,ground,wood,wood,wood,wood,wood,wood,street,ground,ground,ground,ground,hill,hedgerows],[ground,ground,wood,wood,street,street,street,wood,street,street,street,hill,hill,ground,ground],[river,ground,ground,street,street,hill,street,street,street,wood,street,street,hill,ground,ground],[river,river,street,street,hill,ground,street,river,river,wood,wood,wood,hill,ground,ground],[street,street,street,river,river,river,river,ground,ground,river,river,street,river,river,ground],[street,hill,hill,hill,ground,hill,hill,street,street,street,street,street,hill,river,ground],[street,hill,ground,ground,ground,ground,street,hill,ground,street,ground,hill,ground,ground,river],[street,hedgerows,hedgerows,ground,ground,ground,street,street,hill,street,ground,hill,ground,ground,ground],[street,street,hedgerows,ground,ground,ground,ground,street,street,street,hedgerows,hedgerows,ground,ground,ground],[ground,street,hedgerows,street,street,street,ground,ground,ground,street,hedgerows,ground,ground,ground,ground],[ground,street,street,street,ground,street,ground,ground,ground,street,hedgerows,ground,ground,ground,ground],[ground,ground,ground,ground,ground,street,street,street,street,street,hedgerows,ground,ground,ground,ground]]};
k_09_15x15 = {name:"k_09_15x15",bgModel:"k_09_15x15.swf",units:[["BowCavalry","undefined",7,14,"sarazen",10],["Trebuchet","undefined",14,8,"sarazen",10],["Ballista","undefined",10,9,"sarazen",10],["Catapult","undefined",14,6,"sarazen",10],["HeavyCavalry","undefined",14,4,"sarazen",12],["LightCavalry","undefined",14,5,"sarazen",10],["SiegeTower","undefined",12,4,"sarazen",10],["Archer","undefined",11,11,"sarazen",10],["Spearman","undefined",10,13,"sarazen",10],["Swordsman","undefined",13,11,"sarazen",10],["BowCavalry","undefined",10,4,"crusader",10],["Guard","undefined",9,3,"crusader",5],["Guard","undefined",2,4,"crusader",5],["Trebuchet","undefined",4,3,"crusader",10],["Ship","undefined",0,8,"crusader",10],["LightCavalry","undefined",11,3,"crusader",10],["FlyingUnit","undefined",10,0,"crusader",10],["Spearman","undefined",6,0,"crusader",10],["Swordsman","undefined",5,4,"crusader",10]],cities:[["Harbour","no","crusader_harbour_mc",0,6],["Harbour","no","sarazen_harbour_mc",1,13],["Barracks","no","sarazen_barracks_mc",5,8],["Barracks","no","crusader_barracks_mc",5,5],["Factory","no","sarazen_factory_mc",6,7],["Factory","no","sarazen_factory_mc",3,11],["Factory","no","crusader_factory_mc",2,9],["Airport","no","crusader_airport_mc",1,8],["LightFactory","sarazen","sarazen_l-factory_mc",12,9],["Barracks","sarazen","sarazen_barracks_mc",9,13],["Factory","sarazen","sarazen_factory_mc",5,11],["Airport","sarazen","sarazen_airport_mc",8,9],["Town","sarazen","sarazen_town_mc",13,8],["Town","sarazen","sarazen_town_mc",6,13],["Town","sarazen","sarazen_town_mc",10,12],["Village","sarazen","sarazen_village_mc",4,14],["Headquarter","sarazen","sarazen_hq_mc",12,13],["LightFactory","crusader","crusader_l-factory_mc",13,2],["Barracks","crusader","crusader_barracks_mc",8,3],["Factory","crusader","crusader_factory_mc",7,1],["Town","crusader","crusader_town_mc",10,2],["Town","crusader","crusader_town_mc",3,5],["Town","crusader","crusader_town_mc",2,4],["Village","crusader","crusader_village_mc",12,1],["Village","crusader","crusader_village_mc",6,3],["Village","crusader","crusader_village_mc",1,4],["Headquarter","crusader","crusader_hq_mc",5,1]],terrain:[[sea,sea,sea,sea,sea,street,sea,sea,sea,sea,sea,sea,sea,sea,sea],[sea,sea,sea,sea,ground,street,street,street,street,sea,sea,sea,sea,sea,street],[hedgerows,sea,hedgerows,hedgerows,street,street,hill,ground,street,street,sea,sea,sea,sea,street],[ground,river,wood,street,street,street,hill,hill,ground,street,street,street,street,street,street],[river,wood,wood,street,wood,hill,hill,ground,ground,hedgerows,hedgerows,hedgerows,street,hedgerows,ground],[river,street,street,street,street,street,hill,street,street,street,street,street,street,hedgerows,hedgerows],[ground,street,ground,ground,wood,street,hill,street,swamp,swamp,swamp,ground,street,street,ground],[wood,street,wood,wood,wood,street,hill,street,street,street,swamp,swamp,ground,street,ground],[wood,wood,wood,street,street,street,hill,ground,swamp,street,swamp,swamp,hedgerows,street,ground],[wood,ground,street,street,ground,wood,hill,hill,swamp,street,ground,hedgerows,hedgerows,street,ground],[ground,ground,street,ground,ground,wood,wood,wood,ground,street,ground,hedgerows,street,street,ground],[ground,ground,street,street,street,hill,wood,wood,ground,street,ground,ground,hedgerows,street,ground],[ground,ground,ground,ground,street,hill,wood,wood,street,street,street,ground,street,street,ground],[ground,ground,street,street,street,hill,wood,ground,street,ground,street,ground,street,ground,ground],[ground,ground,ground,hill,street,street,street,street,street,ground,street,street,street,ground,ground]]};
k_10_20x20 = {name:"k_10_20x20",bgModel:"k_10_20x20.swf",units:[["Guard","undefined",17,12,"sarazen",5],["Trebuchet","undefined",7,18,"sarazen",10],["Ballista","undefined",11,14,"sarazen",10],["Catapult","undefined",10,13,"sarazen",10],["HeavyCavalry","undefined",14,14,"sarazen",12],["LightCavalry","undefined",11,15,"sarazen",10],["BowCavalry","undefined",10,12,"sarazen",10],["FlyingUnit","undefined",18,18,"sarazen",10],["Archer","undefined",13,13,"sarazen",10],["Spearman","undefined",12,11,"sarazen",10],["Trebuchet","undefined",4,0,"crusader",10],["HeavyCavalry","undefined",15,2,"crusader",12],["HeavyCavalry","undefined",11,5,"crusader",12],["HeavyCavalry","undefined",4,3,"crusader",12],["Spearman","undefined",5,1,"crusader",10],["Spearman","undefined",6,7,"crusader",10],["Swordsman","undefined",3,6,"crusader",10],["Swordsman","undefined",6,2,"crusader",10]],cities:[["Barracks","no","crusader_barracks_mc",1,10],["Factory","no","crusader_factory_mc",2,9],["Airport","no","crusader_airport_mc",5,9],["Village","no","crusader_village_mc",7,7],["LightFactory","no","sarazen_l-factory_mc",7,13],["Barracks","no","crusader_barracks_mc",17,4],["Barracks","no","sarazen_barracks_mc",17,8],["Factory","no","crusader_factory_mc",18,0],["Factory","no","sarazen_factory_mc",9,16],["Town","no","crusader_town_mc",5,7],["Town","no","crusader_town_mc",7,5],["Town","no","crusader_town_mc",12,1],["Town","no","sarazen_town_mc",18,7],["Village","no","sarazen_village_mc",15,9],["Village","no","sarazen_village_mc",16,14],["LightFactory","crusader","crusader_l-factory_mc",3,2],["Barracks","crusader","crusader_barracks_mc",1,5],["Town","crusader","crusader_town_mc",2,3],["Headquarter","crusader","crusader_hq_mc",2,1],["LightFactory","sarazen","sarazen_l-factory_mc",12,13],["Barracks","sarazen","sarazen_barracks_mc",11,13],["Factory","sarazen","sarazen_factory_mc",14,12],["Airport","sarazen","sarazen_airport_mc",13,14],["Airport","sarazen","sarazen_airport_mc",12,12],["Town","sarazen","sarazen_town_mc",11,11],["Town","sarazen","sarazen_town_mc",12,10],["Town","sarazen","sarazen_town_mc",14,11],["Headquarter","sarazen","sarazen_hq_mc",13,12]],terrain:[[ground,ground,ground,swamp,swamp,hedgerows,river,river,ground,hedgerows,hedgerows,wood,wood,wood,wood,ground,ground,ground,ground,ground],[ground,ground,ground,ground,street,street,street,river,hedgerows,street,street,street,street,street,wood,wood,ground,ground,ground,ground],[street,street,street,street,street,swamp,street,hedgerows,river,street,ground,hedgerows,wood,street,ground,ground,ground,ground,ground,ground],[street,ground,street,ground,swamp,swamp,street,hedgerows,river,street,ground,hedgerows,street,street,street,street,street,hill,hill,hill],[street,ground,ground,ground,ground,river,street,river,river,street,ground,hedgerows,hedgerows,hedgerows,hill,hill,street,street,street,ground],[street,street,street,ground,ground,river,street,street,street,street,hedgerows,hill,hill,hill,ground,hedgerows,hedgerows,hedgerows,street,ground],[ground,ground,street,street,street,river,hedgerows,ground,hedgerows,hedgerows,hill,ground,ground,ground,ground,ground,ground,ground,street,ground],[ground,ground,ground,ground,street,street,ground,ground,hedgerows,hill,ground,ground,ground,street,street,street,street,street,street,ground],[hedgerows,hedgerows,river,river,river,street,ground,hedgerows,hill,ground,ground,ground,street,street,ground,ground,street,ground,ground,ground],[river,river,hedgerows,street,street,street,ground,hedgerows,hedgerows,hill,ground,ground,street,ground,ground,ground,street,ground,ground,ground],[ground,hedgerows,street,street,hedgerows,ground,ground,ground,hedgerows,hill,ground,ground,street,ground,ground,ground,street,ground,ground,ground],[ground,ground,street,hedgerows,hedgerows,ground,ground,hedgerows,hill,ground,ground,street,street,street,street,street,street,ground,ground,ground],[ground,street,street,hedgerows,ground,ground,ground,hedgerows,hill,ground,street,street,street,street,street,ground,ground,ground,ground,ground],[ground,ground,street,ground,ground,ground,hedgerows,hedgerows,hill,ground,ground,ground,street,street,street,ground,ground,ground,ground,ground],[ground,ground,street,ground,ground,ground,hedgerows,hill,ground,ground,ground,street,street,street,ground,ground,ground,ground,ground,ground],[street,street,street,street,street,ground,hedgerows,hedgerows,hill,ground,ground,ground,ground,street,ground,ground,ground,ground,ground,ground],[street,ground,ground,ground,street,hedgerows,hedgerows,hedgerows,hill,hill,hill,ground,ground,street,ground,ground,ground,ground,ground,ground],[street,wood,ground,ground,street,street,street,hedgerows,street,street,street,street,street,street,ground,ground,ground,ground,ground,ground],[street,wood,ground,ground,hedgerows,hedgerows,street,street,street,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground],[wood,ground,ground,hedgerows,hedgerows,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground,ground]]};
