import requests
import hashlib
import json
import random
import time
import sys


class CCrush(object):
    def __init__(self, session):
        self.session = session
        self.userId = self.get_user_id()
        self.MIN_SCORE = 400000
        self.MAX_SCORE = 400000

    def get_user_id(self):
        return self.poll().json()["currentUser"]["userId"]

    def poll(self):
        params = {"_session": self.session}
        return requests.get("http://candycrush.king.com/api/poll", params=params)

    def get_balance(self):
        params = {"_session": self.session}
        return requests.get("http://candycrush.king.com/api/getBalance", params=params)

    def get_top_list(self, episode, level):
        params = {"_session": self.session, "arg0": episode, "arg1": level}
        return requests.get("http://candycrush.king.com/api/getLevelToplist", params=params)

    def hand_out_winnings(self, item_type, amount):
        item = [{"type": item_type, "amount": amount}]
        params = {
            "_session": self.session,
            "arg0": json.dumps(item),
            "arg1": 1,
            "arg2": 1,
            "arg3": "hash",
        }
        return requests.get("http://candycrush.king.com/api/handOutItemWinnings", params=params)

    def add_life(self):
        params = {"_session": self.session}
        return requests.get("http://candycrush.king.com/api/addLife", params=params)

    def start_game(self, episode, level):
        params = {"_session": self.session, "arg0": episode, "arg1": level}
        return requests.get("http://candycrush.king.com/api/gameStart", params=params)
 
    def end_game(self, episode, level, seed, score=None):
        if score is None:
            score = random.randrange(self.MIN_SCORE, self.MAX_SCORE)
        dict = {
            "timeLeftPercent": -1,
            "episodeId": episode,
            "levelId": level,
            "score": score,
            "variant": 0,
            "seed": seed,
            "reason": 0,
        }
        dict["userId"] = self.userId
        dict["cs"] = hashlib.md5("%(episodeId)s:%(levelId)s:%(score)s:%(timeLeftPercent)s:%(userId):%(seed)s:BuFu6gBFv79BH9hk" % dic).hexdigest()[:6]

        params = {"_session": self.session, "arg0": json.dumps(dict)}
        return requests.get("http://candycrush.king.com/api/gameEnd", params=params)

    def play_game(self, episode, level, score=None):
        seed = self.start_game(episode, level).json()["seed"]
        return self.end_game(episode, level, seed, score)


if __name__ == "__main__":
    ccrush = CCrush(sys.argv[1])
    episode = int(sys.argv[2])
    level = int(sys.argv[3])
    seed = ccrush.start_game(episode, level)
    ccrush.end_game(episode, level, seed)