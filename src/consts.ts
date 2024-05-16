import { DifficultyEnum } from '@gekichumai/dxdata';

export const LEVEL = ['绿', '黄', '红', '紫', '白'] as const;
export const LEVEL_EN = [DifficultyEnum.Basic, DifficultyEnum.Advanced, DifficultyEnum.Expert, DifficultyEnum.Master, DifficultyEnum.ReMaster] as const;
export const FC = ['', 'FC', 'FC+', 'AP', 'AP+'] as const;
export const PLATE_VER = ['真', '超', '檄', '橙', '晓', '桃', '樱', '紫', '堇', '白', '雪', '辉', '舞', '熊', '华', '爽',
	'煌', '宙', '星', '祭', '祝'] as const;
export const PLATE_TYPE = ['极', '将', '神', '舞舞'] as const;
export const BA_VE = '霸者';
export const PLATE_VER_LIST = {
	'真': ['maimai', 'maimai PLUS'],
	'超': ['GreeN'],
	'檄': ['GreeN PLUS'],
	'橙': ['ORANGE'],
	'晓': ['ORANGE PLUS'],
	'桃': ['PiNK'],
	'樱': ['PiNK PLUS'],
	'紫': ['MURASAKi'],
	'堇': ['MURASAKi PLUS'],
	'白': ['MiLK'],
	'雪': ['MiLK PLUS'],
	'辉': ['FiNALE'],
	'熊': ['maimaiでらっくす', 'maimaiでらっくす PLUS'],
	'华': ['maimaiでらっくす', 'maimaiでらっくす PLUS'],
	'爽': ['Splash'],
	'煌': ['Splash PLUS'],
	'宙': ['UNiVERSE'],
	'星': ['UNiVERSE PLUS'],
	'祭': ['FESTiVAL'],
	'祝': ['FESTiVAL PLUS'],
	'舞': ['maimai', 'maimai PLUS', 'GreeN', 'GreeN PLUS', 'ORANGE',
		'ORANGE PLUS', 'PiNK', 'PiNK PLUS', 'MURASAKi', 'MURASAKi PLUS',
		'MiLK', 'MiLK PLUS', 'FiNALE'],
	'霸者': ['maimai', 'maimai PLUS', 'GreeN', 'GreeN PLUS', 'ORANGE',
		'ORANGE PLUS', 'PiNK', 'PiNK PLUS', 'MURASAKi', 'MURASAKi PLUS',
		'MiLK', 'MiLK PLUS', 'FiNALE']
} as const;
export const VER_MUSIC_LIST = {
	maimai: [
		8, 9, 17, 18, 22, 23, 24, 25, 27, 30,
		31, 35, 38, 40, 42, 44, 46, 47, 53, 56,
		61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
		71, 73, 75, 76, 77, 78, 79, 80, 81, 82,
		83, 84, 85
	],
	'maimai PLUS': [
		58, 100, 101, 102, 106, 107, 108, 109,
		110, 111, 112, 113, 114, 116, 117, 118,
		119, 120, 121, 122, 125, 128, 130, 131,
		132, 133, 134, 135, 136, 137, 138, 139,
		140, 141, 142, 143, 144, 145, 146, 147,
		152, 153, 154, 155, 157, 159
	],
	GreeN: [
		115, 181, 184, 185, 186, 187, 188, 189, 190,
		191, 193, 194, 198, 199, 200, 201, 202, 203,
		204, 205, 206, 207, 208, 209, 212, 213, 214,
		216, 217, 218, 219, 220, 223, 224, 226, 227,
		237, 238, 239, 240, 241, 246, 248, 252, 253,
		255, 256, 258, 259, 260, 261, 262, 263, 264,
		265, 266, 267, 268, 269
	],
	'GreeN PLUS': [
		192, 225, 229, 230, 231, 232, 233, 234,
		235, 247, 251, 254, 270, 271, 278, 282,
		284, 285, 290, 291, 298, 301, 303, 305,
		308, 309, 310, 311, 313, 315, 316, 319,
		320, 321, 322, 323, 324, 325, 326, 327,
		328, 329, 330, 332, 337, 339, 341, 342,
		343, 344, 345, 346, 347
	],
	ORANGE: [
		228, 244, 281, 295, 296, 297,
		314, 331, 349, 351, 352, 353,
		362, 366, 367, 374, 375, 378,
		379, 381, 382, 383, 384, 385,
		386, 387, 388, 389, 390, 399
	],
	'ORANGE PLUS': [
		242, 288, 289, 293, 299, 300, 302,
		312, 318, 348, 363, 364, 365, 376,
		380, 400, 401, 403, 404, 408, 409,
		410, 413, 414, 417, 418, 419, 420,
		421, 422, 436, 437, 438, 439, 440
	],
	PiNK: [
		359, 360, 407, 411, 412, 424, 425,
		426, 427, 434, 435, 446, 447, 448,
		449, 451, 453, 454, 455, 456, 457,
		458, 459, 460, 462, 463, 464, 465,
		466, 468, 471, 472, 477, 480, 482,
		483
	],
	'PiNK PLUS': [
		431, 461, 467, 490, 492, 494, 495,
		496, 497, 506, 507, 508, 511, 515,
		517, 518, 520, 521, 523, 524, 526,
		527, 528, 529, 530, 531, 532, 533,
		534, 536, 537, 538, 539, 542, 543
	],
	MURASAKi: [
		280, 283, 488, 493, 509, 512, 513, 516,
		519, 535, 546, 547, 548, 552, 553, 555,
		556, 557, 558, 559, 560, 561, 565, 566,
		567, 568, 571, 572, 573, 574, 578, 579,
		580, 581, 582, 583, 584, 585, 589, 592,
		593, 598, 599, 601, 602, 603, 606
	],
	'MURASAKi PLUS': [
		236, 432, 514, 541, 587, 610, 611,
		612, 613, 614, 617, 618, 620, 621,
		622, 624, 625, 626, 627, 628, 629,
		630, 631, 632, 634, 636, 637, 639,
		640, 641, 647, 648, 649, 654, 655,
		657, 658, 663, 664, 665, 666, 853
	],
	MiLK: [
		540, 586, 642, 643, 659, 668, 669, 670,
		672, 673, 674, 675, 676, 677, 678, 679,
		680, 681, 682, 683, 684, 687, 688, 689,
		690, 691, 692, 693, 694, 695, 696, 697,
		698, 699, 700, 701, 702, 704, 705, 706,
		707, 708, 709, 710, 711, 712, 713, 719,
		720, 721, 722, 723, 725, 726
	],
	'MiLK PLUS': [
		510, 525, 650, 731, 732, 733, 734, 735,
		736, 737, 738, 739, 740, 741, 742, 743,
		745, 746, 747, 748, 750, 753, 756, 757,
		758, 759, 760, 761, 762, 763, 764, 765,
		766, 767, 768, 769, 770, 771, 772, 773,
		775, 776, 777, 778, 779, 781, 782, 786
	],
	FiNALE: [
		564, 717, 751, 752, 787, 789, 790, 791, 792,
		793, 794, 796, 797, 798, 799, 800, 801, 802,
		803, 804, 805, 806, 807, 809, 810, 811, 812,
		815, 816, 817, 818, 819, 820, 821, 822, 823,
		825, 826, 827, 829, 830, 831, 832, 833, 834,
		835, 836, 837, 838, 839, 840, 841, 842, 844,
		847, 848, 849, 850, 852
	],
	'maimaiでらっくす': [
		10125, 10146, 10191, 10256, 10288, 10301, 10319,
		10363, 10420, 10536, 10560, 10572, 10593, 10641,
		10665, 10668, 10702, 10706, 10734, 11001, 11002,
		11003, 11004, 11005, 11006, 11007, 11008, 11009,
		11010, 11014, 11015, 11016, 11017, 11018, 11019,
		11020, 11021, 11022, 11023, 11024, 11025, 11026,
		11027, 11028, 11029, 11030, 11031, 11034, 11037,
		11043, 11044, 11046, 11048, 11050, 11051, 11052,
		11058, 11059, 11060, 11061, 11064, 11065, 11066,
		11067, 11069, 11070, 11073, 11075, 11077, 11078,
		11080, 11081, 11083, 11084, 11085, 11086, 11087,
		11088
	],
	'maimaiでらっくす PLUS': [
		10181, 11032, 11049, 11089, 11090, 11091,
		11092, 11093, 11094, 11095, 11096, 11097,
		11098, 11099, 11100, 11101, 11102, 11103,
		11104, 11105, 11106, 11107, 11108, 11109,
		11110, 11111, 11113, 11115, 11118, 11119,
		11121, 11122, 11123, 11124, 11125, 11126,
		11127, 11128, 11129, 11130, 11131, 11132,
		11133, 11134, 11135, 11136, 11137, 11138,
		11139, 11140, 11141, 11142, 11143, 11145,
		11146, 11147, 11148, 11149, 11150
	],
	Splash: [
		10188, 10690, 11152, 11153, 11154, 11155,
		11156, 11157, 11158, 11159, 11160, 11161,
		11162, 11163, 11164, 11165, 11166, 11167,
		11168, 11171, 11172, 11173, 11174, 11175,
		11176, 11177, 11183, 11184, 11185, 11186,
		11187, 11188, 11189, 11190, 11191, 11192,
		11193, 11194, 11195, 11197, 11198, 11199,
		11200, 11201, 11202, 11204, 11205, 11206,
		11207, 11208, 11209, 11210, 11211, 11212,
		11213, 11214, 11215, 11216, 11218, 11219,
		11221
	],
	'Splash PLUS': [
		11169, 11170, 11222, 11223, 11224, 11225,
		11226, 11227, 11228, 11229, 11230, 11231,
		11232, 11233, 11234, 11235, 11236, 11237,
		11238, 11239, 11240, 11241, 11242, 11243,
		11246, 11247, 11248, 11249, 11253, 11255,
		11258, 11260, 11261, 11262, 11263, 11264,
		11265, 11266, 11267, 11268, 11269, 11270,
		11271, 11272, 11273, 11274, 11275, 11276,
		11277, 11278, 11279, 11280, 11281, 11282,
		11283, 11284, 11285, 11286, 11287, 11288,
		11289, 11290, 11291, 11292, 11293
	],
	UNiVERSE: [
		1020, 1051, 10552, 10602, 11294, 11295, 11296,
		11297, 11298, 11299, 11300, 11301, 11302, 11303,
		11304, 11305, 11306, 11307, 11308, 11309, 11310,
		11311, 11312, 11313, 11314, 11315, 11316, 11317,
		11318, 11319, 11321, 11322, 11323, 11324, 11325,
		11327, 11328, 11329, 11330, 11331, 11333, 11334,
		11335, 11336, 11337, 11340, 11341, 11342, 11343,
		11344, 11345, 11347, 11348, 11349, 11350, 11351,
		11352, 11353, 11354, 11355, 11356, 11358, 11359,
		11360, 11361, 11362, 11363, 11364, 11365, 11367,
		11369, 11370, 11371, 11372, 11373, 11374
	],
	'UNiVERSE PLUS': [
		1081, 1085, 10145, 10193, 10202, 11346, 11375,
		11376, 11377, 11378, 11379, 11380, 11381, 11382,
		11383, 11384, 11385, 11386, 11387, 11388, 11389,
		11390, 11391, 11392, 11393, 11394, 11395, 11396,
		11398, 11399, 11400, 11401, 11402, 11404, 11405,
		11406, 11407, 11408, 11409, 11410, 11411, 11412,
		11413, 11415, 11418, 11419, 11420, 11421, 11422,
		11423, 11424, 11425, 11426, 11427, 11428, 11429,
		11430, 11431, 11432, 11433, 11434, 11435, 11436,
		11437, 11438, 11439, 11441, 11443, 11444, 11445,
		11446, 11447, 11448, 11449, 11450, 11451
	],
	FESTiVAL: [
		1235, 10070, 10190, 10235, 10302, 10316, 10404,
		10625, 11452, 11453, 11454, 11455, 11456, 11457,
		11458, 11459, 11460, 11461, 11462, 11463, 11464,
		11465, 11466, 11467, 11468, 11469, 11470, 11471,
		11472, 11473, 11474, 11475, 11477, 11478, 11479,
		11480, 11481, 11482, 11483, 11484, 11485, 11486,
		11487, 11488, 11489, 11490, 11491, 11492, 11493,
		11494, 11495, 11496, 11497, 11498, 11499, 11500,
		11501, 11502, 11503, 11504, 11505, 11506, 11507,
		11508, 11509, 11510, 11511, 11512, 11513, 11514,
		11516, 11517, 11518, 11519, 11520, 11521, 11523,
		11524, 11525
	],
	'FESTiVAL PLUS': [
		10204, 10251, 10315, 10574, 11526, 11527, 11528,
		11529, 11530, 11532, 11533, 11538, 11539, 11540,
		11541, 11542, 11543, 11544, 11545, 11546, 11547,
		11548, 11549, 11550, 11551, 11552, 11553, 11554,
		11555, 11556, 11557, 11558, 11559, 11560, 11561,
		11562, 11563, 11564, 11565, 11566, 11568, 11569,
		11570, 11571, 11572, 11573, 11574, 11575, 11576,
		11577, 11583, 11584, 11585, 11586, 11587, 11588,
		11589, 11590, 11591, 11592, 11593, 11594, 11596,
		11598, 11599, 11600, 11601, 11602, 11603, 11604,
		11605, 11606, 11607
	]
} as const;
export const MAIMAI_DX_RELEASE_DATE = new Date('2019-07-11');
