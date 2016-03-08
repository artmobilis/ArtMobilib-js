var AM = AM || {};


/**
 * Matches descriptors
 * @class
 */
AM.Matching = function() {

  var _screen_descriptors;

  var _num_matches;
  var _matches = [];

  var _params = {
    match_threshold: 48
  }

  /**
   *
   * @inner
   * @param {jsfeat.matrix_t} screen_descriptors
   */
  this.SetScreenDescriptors = function(screen_descriptors) {
    _screen_descriptors = screen_descriptors;
  };

  /**
   * Computes the matching.
   * @inner
   * @param {jsfeat.matrix_t[]} pattern_descriptors - The descriptors of a trained image.
   * @returns {number} The number of matches of the best match if there is a match, 0 otherwise.
   */
  this.Match = function(pattern_descriptors) {
    _num_matches = MatchPattern(_screen_descriptors, pattern_descriptors);
    return _num_matches;
  };

  function popcnt32(n) {
    n -= ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4))& 0xF0F0F0F)* 0x1010101) >> 24;
  }

  var popcnt32_2 = function() {
    var v2b = [
      0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8,
    ];

    var m8 = 0x000000ff;

    return function(n) {
      var r = v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      return r;
    }
  }();

  var popcnt32_3 = function() {

    var v2b = [];
    for (i = 0; i < 256 * 256; ++i)
      v2b.push(popcnt32(i));

    var m16 = 0x0000ffff;

    return function(n) {
      var r = v2b[n & m16];
      n = n >> 16;
      r += v2b[n & m16];
      return r;
    }
  }();

  function MatchPattern(screen_descriptors, pattern_descriptors) {
    var q_cnt = screen_descriptors.rows;
    var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
    var qd_off = 0;
    var num_matches = 0;

    _matches = [];

    for (var qidx = 0; qidx < q_cnt; ++qidx) {
      var best_dist = 256;
      var best_dist2 = 256;
      var best_idx = -1;
      var best_lev = -1;

      for (var lev = 0, lev_max = pattern_descriptors.length; lev < lev_max; ++lev) {
        var lev_descr = pattern_descriptors[lev];
        var ld_cnt = lev_descr.rows;
        var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
        var ld_off = 0;

        for (var pidx = 0; pidx < ld_cnt; ++pidx) {

          var curr_d = 0;
          // our descriptor is 32 bytes so we have 8 Integers
          for (var k = 0; k < 8; ++k) {
            curr_d += popcnt32_3(query_u32[qd_off + k] ^ ld_i32[ld_off + k]);
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

    _matches.length = num_matches;
    return num_matches;
  }

  /**
   * Returns the matches
   * @inner
   * @returns {AM.match_t[]} The buffer of matches
   */
  this.GetMatches = function() {
    return _matches;
  };

  /**
   * Returns the number of matches
   * @inner
   * @returns {number}
   */
  this.GetNumMatches = function() {
    return _num_matches;
  };

  /**
   * Sets parameters of the matching
   * @inner
   * @param {object} params
   * @param {number} [params.match_threshold=48] 16 - 128
   */
  this.SetParameters = function(params) {
    for (name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};

/**
 *
 * @class
 * @param {number} screen_idx
 * @param {number} pattern_lev
 * @param {number} pattern_idx
 * @param {number} distance
 */ 
AM.match_t = function (screen_idx, pattern_lev, pattern_idx, distance) {
  this.screen_idx = screen_idx || 0;
  this.pattern_lev = pattern_lev || 0;
  this.pattern_idx = pattern_idx || 0;
  this.distance = distance || 0;
};