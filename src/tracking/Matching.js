var AM = AM || {};

AM.Matching = function() {

  var _screen_descriptors;

  var _num_matches;
  var _matches = [];

  var _params = {
    match_threshold: 48
  }

  this.SetScreenDescriptors = function(screen_descriptors) {
    _screen_descriptors = screen_descriptors;
  };

  this.Match = function(pattern_descriptors) {

    function popcnt32(n) {
      n -= ((n >> 1) & 0x55555555);
      n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
      return (((n + (n >> 4))& 0xF0F0F0F)* 0x1010101) >> 24;
    }

    function MatchPattern(screen_descriptors, pattern_descriptors) {
      var q_cnt = screen_descriptors.rows;
      var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
      var qd_off = 0;
      var num_matches = 0;

      _matches.length = 0;

      for (var qidx = 0; qidx < q_cnt; ++qidx) {
        var best_dist = 256;
        var best_dist2 = 256;
        var best_idx = -1;
        var best_lev = -1;

        for (var lev = 0; lev < pattern_descriptors.length; ++lev) {
          var lev_descr = pattern_descriptors[lev];
          var ld_cnt = lev_descr.rows;
          var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
          var ld_off = 0;

          for (var pidx = 0; pidx < ld_cnt; ++pidx) {

            var curr_d = 0;
            // our descriptor is 32 bytes so we have 8 Integers
            for (var k = 0; k < 8; ++k) {
              curr_d += popcnt32(query_u32[qd_off + k] ^ ld_i32[ld_off + k]);
            }

            if (curr_d < best_dist) {
              best_dist2 = best_dist;
              best_dist = curr_d;
              best_lev = lev;
              best_idx = pidx;
            } else if (curr_d < best_dist2) {
              best_dist2 = curr_d;
            }

            ld_off += 8; // next descriptor
          }
        }

        // filter out by some threshold
        if (best_dist < _params.match_threshold) {

          while (_matches.length <= num_matches) {
            _matches.push(new AM.match_t());
          }

          _matches[num_matches].screen_idx = qidx;
          _matches[num_matches].pattern_lev = best_lev;
          _matches[num_matches].pattern_idx = best_idx;
          num_matches++;
        }

        // filter using the ratio between 2 closest matches
        /*if(best_dist < 0.8*best_dist2) {
          while (_matches.length <= num_matches) {
            _matches.push(new AM.match_t());
          }
          _matches[num_matches].screen_idx = qidx;
          _matches[num_matches].pattern_lev = best_lev;
          _matches[num_matches].pattern_idx = best_idx;
          num_matches++;
        }*/
        

        qd_off += 8; // next query descriptor
      }

      return num_matches;
    }

    _num_matches = MatchPattern(_screen_descriptors, pattern_descriptors);

    return _num_matches;
  };

  this.GetMatches = function() {
    return _matches;
  };

  this.GetNumMatches = function() {
    return _num_matches;
  };

  this.SetParameters = function(params) {
    for (name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};

// our point match structure
AM.match_t = (function () {
  function match_t(screen_idx, pattern_lev, pattern_idx, distance) {
    this.screen_idx = screen_idx || 0;
    this.pattern_lev = pattern_lev || 0;
    this.pattern_idx = pattern_idx || 0;
    this.distance = distance || 0;
  }
  return match_t;
})();