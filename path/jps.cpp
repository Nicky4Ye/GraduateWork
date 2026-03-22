#include <string.h>
#include <stdlib.h>

#include "jps.h"
#include "transform_coord.h"

typedef enum
{
    TOP,
    LEFT_TOP,
    LEFT_BOTTOM,
    BOTTOM,
    RIGHT_BOTTOM,
    RIGHT_TOP,
} JPS_DIR;

static Node *find_uni_force_neighbor(PathFinder* pf, Node *node,
    JPS_DIR dir, bool ignore_set_dir);
static Node *find_multi_force_neighbor(PathFinder* pf, Node *node,
    Node *enode, JPS_DIR dir);
static void init_dirset(Node *node);
static void add_dirset(Node *node, JPS_DIR dir);
static bool is_jps_block(PathFinder* pf, int row, int col);
static void save_jps_path(PathFinder* pf, Node* enode);
static void add_jps_dirset(unsigned char *dirset, int dir);
static void search_jump_point(PathFinder* pf, Node *current, Node *enode, JPS_DIR dir);
Node* jump_unidirectional(PathFinder* pf, Node *current, Node *enode,
    JPS_DIR dir, int *cost, bool ignore_set_dir);
static void interpolate_cardinal_path(PathFinder* pf, Node *cur, Node *parent);
static void interpolate_diagonal_path(PathFinder* pf, Node *cur, Node *parent);
static void add_jps_open(PathFinder* pf, Node *node, Node *parent, int cost);
static int compute_jps_h(PathFinder* pf, Node* node);
static void save_jps_path(PathFinder* pf, Node* enode);

bool
find_jps_path(PathFinder* pf, int start_row, int start_col, int end_row, int end_col) {
    pf->start_row = start_row;
    pf->start_col = start_col;
    pf->end_row = end_row;
    pf->end_col = end_col;
    Map* map = pf->map;
    reset_queue(pf->open_list);
    Node *snode;
    get_pathfind_node(map, pf, start_row, start_col, snode);
    snode->row = start_row;
    snode->col = start_col;
    Node *enode;
    get_pathfind_node(map, pf, end_row, end_col, enode);
    enode->row = end_row;
    enode->col = end_col;
    add_jps_open(pf, snode, NULL, 0);
    
    while (queue_size(pf->open_list) > 0) {
        Node* current = queue_pop(pf->open_list);
        if (current->row == end_row && current->col == end_col) {
            save_jps_path(pf, current);
            return true;
        }
        current->status = STATUS_CLOSE;
        if(current->parent == NULL) {
            current->dirset = 0;
            for(int i = TOP;i <= RIGHT_TOP;i++) {
                add_jps_dirset(&current->dirset, i);               
            }
        }
        int (*dir_list)[2] = get_neighbor_offset(current->row);
        for (int i = TOP; i <= RIGHT_TOP; i++) {
            if((current->dirset & (1 << i)) == 0)
                continue;
            int row_dir = *(*(dir_list+i)+0);
            int col_dir = *(*(dir_list+i)+1);
            int nr = current->row + row_dir;
            int nc = current->col + col_dir;
            if (!is_valid_grid(map, nr, nc))
                continue;
            if(is_block(map, nr, nc))
                continue;
            search_jump_point(pf, current, enode, i);
        }
    }
    save_jps_path(pf, NULL);
    return false;
}

Node*
jump_unidirectional(PathFinder* pf, Node *current, Node *enode,
        JPS_DIR dir, int *cost, bool ignore_set_dir) {
    int (*dir_list)[2] = get_neighbor_offset(current->row);
    int next_row = current->row + (*(dir_list+dir))[0];
    int next_col = current->col + (*(dir_list+dir))[1];
    Map *map = pf->map;
    if(!is_valid_grid(map, next_row, next_col))
        return NULL;

    //阻挡
    if(is_block(map, next_row, next_col))
        return NULL;

    *cost += BASE_COST;

    //目标点
    if(next_row == enode->row && next_col == enode->col)
        return enode;

    //寻找uni方向上的force neighbor
    Node *node;
    get_pathfind_node(map, pf, next_row, next_col, node);
    node->row = next_row;
    node->col = next_col;
    Node *jump = find_uni_force_neighbor(pf, node, dir, ignore_set_dir);
    if(jump)
        return jump;

    return jump_unidirectional(pf, node, enode, dir, cost, ignore_set_dir);
}


Node*
jump_multidirectional(PathFinder* pf, Node *current, Node *enode,
        JPS_DIR dir, int *cost) {
    int (*dir_list)[2] = get_neighbor_offset(current->row);
    int next_row = current->row + (*(dir_list+dir))[0];
    int next_col = current->col + (*(dir_list+dir))[1];
    Map* map = pf->map;
    if(!is_valid_grid(map, next_row, next_col))
        return NULL;
    //阻挡
    if(is_block(map, next_row, next_col))
        return NULL;

    *cost += BASE_COST;

    //目标点
    if(next_row == enode->row && next_col == enode->col)
        return enode;

    //寻找multi方向上的force neighbor
    Node *node;
    get_pathfind_node(map, pf, next_row, next_col, node);
    node->row = next_row;
    node->col = next_col;
    Node *jump = find_multi_force_neighbor(pf, node, enode, dir);
    if(jump)
        return jump;

    return jump_multidirectional(pf, node, enode, dir, cost);
}

/*-------------------private function--------------------*/

static bool
is_jps_block(PathFinder* pf, int row, int col) {
    return !is_valid_grid(pf->map, row, col) ||
        is_block(pf->map, row, col);
}

static Node *
find_uni_force_neighbor(PathFinder* pf, Node *node,
        JPS_DIR dir, bool ignore_set_dir) {
    int next_row = node->row;
    int next_col = node->col;
    int (*next_dir_list)[2] = get_neighbor_offset(next_row);
    switch(dir){
        case BOTTOM: {
            int left_top_row = next_row + (*(next_dir_list + LEFT_TOP))[0];
            int left_top_col = next_col + (*(next_dir_list + LEFT_TOP))[1];
            int left_bottom_row = next_row + (*(next_dir_list + LEFT_BOTTOM))[0];
            int left_bottom_col = next_col + (*(next_dir_list + LEFT_BOTTOM))[1];

            int right_top_row = next_row + (*(next_dir_list + RIGHT_TOP))[0];
            int right_top_col = next_col + (*(next_dir_list + RIGHT_TOP))[1];
            int right_bottom_row = next_row + (*(next_dir_list + RIGHT_BOTTOM))[0];
            int right_bottom_col = next_col + (*(next_dir_list + RIGHT_BOTTOM))[1];

            bool has_left_bottom_force = is_jps_block(pf, left_top_row, left_top_col) &&
                !is_jps_block(pf, left_bottom_row, left_bottom_col);
            bool has_right_bottom_force = is_jps_block(pf, right_top_row, right_top_col) &&
                !is_jps_block(pf, right_bottom_row, right_bottom_col);

            if(!ignore_set_dir) {
				init_dirset(node);
                if(has_left_bottom_force){
                    add_dirset(node, dir);
                    add_dirset(node, LEFT_BOTTOM);
                }
                if(has_right_bottom_force){
                    add_dirset(node, dir);
                    add_dirset(node, RIGHT_BOTTOM);
                }
            }
            if(has_left_bottom_force || has_right_bottom_force)
                return node;
            break;
        }
        case LEFT_TOP: {
            int right_top_row = next_row + (*(next_dir_list + RIGHT_TOP))[0];
            int right_top_col = next_col + (*(next_dir_list + RIGHT_TOP))[1];
            int top_row = next_row + (*(next_dir_list + TOP))[0];
            int top_col = next_col + (*(next_dir_list + TOP))[1];

            int bottom_row = next_row + (*(next_dir_list + BOTTOM))[0];
            int bottom_col = next_col + (*(next_dir_list + BOTTOM))[1];
            int left_bottom_row = next_row + (*(next_dir_list + LEFT_BOTTOM))[0];
            int left_bottom_col = next_col + (*(next_dir_list + LEFT_BOTTOM))[1];

            bool has_top_force = is_jps_block(pf, right_top_row, right_top_col) &&
                !is_jps_block(pf, top_row, top_col);
            bool has_left_bottom_force = is_jps_block(pf, bottom_row, bottom_col) &&
                !is_jps_block(pf, left_bottom_row, left_bottom_col);

            if(!ignore_set_dir) {
				init_dirset(node);
                if(has_top_force){
                    add_dirset(node, dir);
                    add_dirset(node, TOP);
                }
                if(has_left_bottom_force){
                    add_dirset(node, dir);
                    add_dirset(node, LEFT_BOTTOM);
                }
            }
            if(has_top_force || has_left_bottom_force)
                return node;
            break;
        }
        case RIGHT_TOP: {
            int left_top_row = next_row + (*(next_dir_list + LEFT_TOP))[0];
            int left_top_col = next_col + (*(next_dir_list + LEFT_TOP))[1];
            int top_row = next_row + (*(next_dir_list + TOP))[0];
            int top_col = next_col + (*(next_dir_list + TOP))[1];

            int bottom_row = next_row + (*(next_dir_list + BOTTOM))[0];
            int bottom_col = next_col + (*(next_dir_list + BOTTOM))[1];
            int right_bottom_row = next_row + (*(next_dir_list + RIGHT_BOTTOM))[0];
            int right_bottom_col = next_col + (*(next_dir_list + RIGHT_BOTTOM))[1];

            bool has_top_force = is_jps_block(pf, left_top_row, left_top_col) &&
                !is_jps_block(pf, top_row, top_col);

            bool has_right_bottom_force = is_jps_block(pf, bottom_row, bottom_col) &&
                !is_jps_block(pf, right_bottom_row, right_bottom_col);

            if(!ignore_set_dir) {
				init_dirset(node);
                if(has_top_force){
                    add_dirset(node, dir);
                    add_dirset(node, TOP);
                }
                if(has_right_bottom_force){
                    add_dirset(node, dir);
                    add_dirset(node, RIGHT_BOTTOM);
                }
            }
            if(has_top_force || has_right_bottom_force)
                return node;
            break;
        }
        case TOP:
            break;
        case LEFT_BOTTOM:
            break;
        case RIGHT_BOTTOM:
            break;
    }
    return NULL;
}

static Node *
find_multi_force_neighbor(PathFinder* pf, Node *node,
        Node *enode, JPS_DIR dir) {
    int noused_cost;
    switch(dir){
        case TOP: {
            Node *force_neighbor1 = jump_unidirectional(pf, node, enode,
                    LEFT_TOP, &noused_cost, true);
            init_dirset(node);
            if(force_neighbor1) {
                add_dirset(node, dir);
                add_dirset(node, LEFT_TOP);
            }
            Node *force_neighbor2 = jump_unidirectional(pf, node, enode,
                    RIGHT_TOP, &noused_cost, true);
            if(force_neighbor2) {
                add_dirset(node, dir);
                add_dirset(node, RIGHT_TOP);
            }
            if(force_neighbor1 || force_neighbor2)
                return node;
            break;
        }
        case LEFT_BOTTOM: {
            Node *force_neighbor1 = jump_unidirectional(pf, node, enode,
                    LEFT_TOP, &noused_cost, true);
            init_dirset(node);
            if(force_neighbor1) {
                add_dirset(node, dir);
                add_dirset(node, LEFT_TOP);
            }
            Node *force_neighbor2 = jump_unidirectional(pf, node, enode,
                    BOTTOM, &noused_cost, true);
            if(force_neighbor2) {
                add_dirset(node, dir);
                add_dirset(node, BOTTOM);
            }
            if(force_neighbor1 || force_neighbor2)
                return node;
            break;
        }
        case RIGHT_BOTTOM: {
            Node *force_neighbor1 = jump_unidirectional(pf, node, enode,
                    RIGHT_TOP, &noused_cost, true);
            init_dirset(node);
            if(force_neighbor1) {
                add_dirset(node, dir);
                add_dirset(node, RIGHT_TOP);
            }
            Node *force_neighbor2 = jump_unidirectional(pf, node, enode,
                    BOTTOM, &noused_cost, true);
            if(force_neighbor2) {
                add_dirset(node, dir);
                add_dirset(node, BOTTOM);
            }
            if(force_neighbor1 || force_neighbor2)
                return node;
            break;
        }
        case LEFT_TOP:
            break;
        case RIGHT_TOP:
            break;
        case BOTTOM:
            break;
    }
    return NULL;
}

static void
init_dirset(Node *node) {
	node->dirset = 0;
}

static void
add_jps_dirset(unsigned char *dirset, int dir) {
    *dirset |= 1 << dir;
}

static void
add_dirset(Node *node, JPS_DIR dir) {
    add_jps_dirset(&node->dirset, dir);
}

static void
search_jump_point(PathFinder* pf, Node *current, Node *enode, JPS_DIR dir) {
    int cost = 0;
    Node *jump = NULL;
    if(dir == BOTTOM || dir == LEFT_TOP || dir == RIGHT_TOP)
        jump = jump_unidirectional(pf, current, enode, dir, &cost, false);
    else if(dir == TOP || dir == LEFT_BOTTOM || dir == RIGHT_BOTTOM)
        jump = jump_multidirectional(pf, current, enode, dir, &cost);
    if(jump == NULL)
        return;
    if(jump->status == STATUS_CLOSE)
        return;
    if (jump->status == STATUS_OPEN) {
        int  g1 = current->g + cost;
        if (g1 < jump->g) {
            jump->g = g1;
            jump->f = g1 + jump->h;
            queue_adjust(pf->open_list, jump);
        }
    }
    else
        add_jps_open(pf, jump, current, current->g + cost);
}

static void
save_jps_path(PathFinder* pf, Node* enode) {
    Node* cur = enode;
    while (cur) {
        Node *parent = cur->parent;
        if(parent == NULL) {
            PathNode* node = malloc(sizeof(PathNode));
            node->row = cur->row;
            node->col = cur->col;
            node->next = pf->path;
            pf->path = node;
            break;
        }
        if(cur->row == parent->row) {
            interpolate_cardinal_path(pf, cur, parent);
        }
        else {
            interpolate_diagonal_path(pf, cur, parent);
        }
        cur = parent;
    }
}

static int
compute_jps_h(PathFinder* pf, Node* node) {
    int dist;
    cal_grids_dist(pf->map, node->row, node->col, pf->end_row, pf->end_col, dist);
    return BASE_COST * dist;
}

static void
add_jps_open(PathFinder* pf, Node *node, Node *parent, int cost) {
    node->status = STATUS_OPEN;
    node->parent = parent;
    node->g = cost;
    node->h = compute_jps_h(pf, node);
    node->f = node->g + node->h;
    queue_push(pf->open_list, node);
}

static void
interpolate_cardinal_path(PathFinder* pf, Node *cur, Node *parent) {
    //cardinal方向上用offset坐标插值直线路径,性能更好
    if(cur->col > parent->col) {
        for(int i = cur->col;i > parent->col;i--) {
            PathNode* node = malloc(sizeof(PathNode));
            node->row = cur->row;
            node->col = i;
            node->next = pf->path;
            pf->path = node;
        }
    }
    else {
        for(int i = cur->col;i < parent->col;i++) {
            PathNode* node = malloc(sizeof(PathNode));
            node->row = cur->row;
            node->col = i;
            node->next = pf->path;
            pf->path = node;
        }
    }
}

static void
interpolate_diagonal_path(PathFinder* pf, Node *cur, Node *parent) {
    //diagonal方向上用cube坐标插值直线路径,算法会简单很多
    Cube *cur_cube = &pf->map->cubes[cur->row * pf->map->max_col + cur->col];
    Cube *parent_cube = &pf->map->cubes[parent->row * pf->map->max_col + parent->col];
    if(cur_cube->y == parent_cube->y) {
        if(cur_cube->z > parent_cube->z) {
            for(int i = cur_cube->z;i > parent_cube->z;i--) {
                PathNode* node = malloc(sizeof(PathNode));
                cube_to_offset(cur_cube->x + (cur_cube->z - i), 
                        cur_cube->y, i, &node->row, &node->col);
                node->next = pf->path;
                pf->path = node;
            }
        }
        else if(cur_cube->z < parent_cube->z) {
            for(int i = cur_cube->z;i < parent_cube->z;i++) {
                PathNode* node = malloc(sizeof(PathNode));
                cube_to_offset(cur_cube->x + (cur_cube->z - i), 
                        cur_cube->y, i, &node->row, &node->col);
                node->next = pf->path;
                pf->path = node;
            }
        }
    }
    else if(cur_cube->z == parent_cube->z) {
        if(cur_cube->y > parent_cube->y) {
            for(int i = cur_cube->y;i > parent_cube->y;i--) {
                PathNode* node = malloc(sizeof(PathNode));
                cube_to_offset(cur_cube->x + (cur_cube->y - i), 
                        i, cur_cube->z, &node->row, &node->col);
                node->next = pf->path;
                pf->path = node;
            }
        }
        else if(cur_cube->y < parent_cube->y) {
            for(int i = cur_cube->y;i < parent_cube->y;i++) {
                PathNode* node = malloc(sizeof(PathNode));
                cube_to_offset(cur_cube->x + (cur_cube->y - i), 
                        i, cur_cube->z, &node->row, &node->col);
                node->next = pf->path;
                pf->path = node;
            }
        }
    }
}