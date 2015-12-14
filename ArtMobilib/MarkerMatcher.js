// todo license???
// todo: do we separate matching and homograpy validation


match_t = (function () {
    function match_t(screen_idx, pattern_lev, pattern_idx, distance) {
        if (typeof screen_idx === "undefined") {
            screen_idx = 0;
        }
        if (typeof pattern_lev === "undefined") {
            pattern_lev = 0;
        }
        if (typeof pattern_idx === "undefined") {
            pattern_idx = 0;
        }
        if (typeof distance === "undefined") {
            distance = 0;
        }

        this.screen_idx = screen_idx;
        this.pattern_lev = pattern_lev;
        this.pattern_idx = pattern_idx;
        this.distance = distance;
    }

    return match_t;
})();


var MarkerMatcher = function () {

    /// private data
    var that = this;
    
    /// public data
    this.nb_homograpy_valid=8;
    this.nb_matches_valid = 20;
    this.maxMatches = 2000;

    // matching result
    this.matches = [];
    this.num_matches;

    // homography coherence validation
    this.homo3x3;
    this.match_mask;

    this.log = ""; // output log
    
    var init = function () {
        // alloc matches
        that.matches[nb_trained] = [];
        var i = that.maxMatches;
        while (--i >= 0) {
            that.matches[i] = new match_t();
        }

        // transform matrix
        homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
        match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);
    }

    // non zero bits count
    function popcnt32(n) {
        n -= ((n >> 1) & 0x55555555);
        n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
        return (((n + (n >> 4)) & 0xF0F0F0F) * 0x1010101) >> 24;
    }


    // naive brute-force matching.
    // each on screen point is compared to all pattern points
    // to find the closest match
    function match_pattern(screenMarker, patternMarker) {
        var screen_descriptors = screenMarker.pattern_descriptors;
        var pattern_descriptors = patternMarker.pattern_descriptors;
        var q_cnt = screen_descriptors.rows;
        var query_du8 = screen_descriptors.data;
        var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
        var qd_off = 0;
        var qidx = 0, lev = 0, pidx = 0, k = 0;
        var num_matches = 0;

        stat.start("match_pattern");

        for (qidx = 0; qidx < q_cnt; ++qidx) {
            var best_dist = 256;
            var best_dist2 = 256;
            var best_idx = -1;
            var best_lev = -1;

            for (lev = 0; lev < num_train_levels; ++lev) {
                var lev_descr = pattern_descriptors[lev];
                var ld_cnt = lev_descr.rows;
                var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
                var ld_off = 0;

                for (pidx = 0; pidx < ld_cnt; ++pidx) {

                    var curr_d = 0;
                    // our descriptor is 32 bytes so we have 8 Integers
                    for (k = 0; k < 8; ++k) {
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
            if (best_dist < options.match_threshold) {
                matches[num_matches].screen_idx = qidx;
                matches[num_matches].pattern_lev = best_lev;
                matches[num_matches].pattern_idx = best_idx;
                num_matches++;
            }
            //

            /* filter using the ratio between 2 closest matches
            if(best_dist < 0.8*best_dist2) {
                matches[num_matches].screen_idx = qidx;
                matches[num_matches].pattern_lev = best_lev;
                matches[num_matches].pattern_idx = best_idx;
                num_matches++;
            }
            */

            qd_off += 8; // next query descriptor
        }

        stat.stop("match_pattern");

        return num_matches;
    }


    // match with the pattern and test if enough corresponding data trough planar homography
    this.matching = function (screenMarker, patternMarker) {
        var good_matches = 0;

        // search for the right pattern
        that.log = ""
        that.num_matches = match_pattern(screenMarker, patternMarker);
        str += "<br>Id : " + id + " nbMatches : " + num_matches[id];
        if (num_matches < that.nb_matches_valid)
            return false;

        stat.start("find_transform");
        that.good_matches = find_transform(matches, num_matches);
        stat.stop("find_transform");
        str += " nbGood : " + that.good_matches;
        return (that.good_matches > that.nb_homograpy_valid);
    };


};
