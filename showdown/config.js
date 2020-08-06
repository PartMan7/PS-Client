var Config = Config || {};

Config.bannedHosts = ['cool.jit.su', 'pokeball-nixonserver.rhcloud.com'];

Config.whitelist = [
	// general sites
	'wikipedia\\.org',
	'wikimedia\\.org',
	'wiktionary\\.org',
	'github\\.com',
	'reddit\\.com',
	'gamefaqs\\.com',
	'facebook\\.com',
	'fbcdn\\.net',
	'twitter\\.com',
	'tumblr\\.com',
	'deviantart\\.com',
	'youtube\\.com',
	'youtu\\.be',
	'zombo\\.com',
	'strawpoll\\.me',
	'twitch\\.tv',
	'take-a-screenshot\\.org',
	'myanimelist\\.net',
	'4chan\\.org',
	'tumblr\\.com',
	'git\\.io',
	'mibbit\\.com',
	'codecademy\\.com',
	'xkcd\\.com',
	'stackoverflow\\.com',
	'stackexchange\\.com',
	'malwarebytes\\.org',
	'animenewsnetwork\\.com',
	'animenewsnetwork\\.cc',
	'zombo\\.com',
	'html5zombo\\.com',
	'whatismyipaddress\\.com',

	// pokemon sites
	'pokemonshowdown\\.com',
	'psim\\.us',
	'smogon\\.com',
	'upokecenter\\.com',
	'veekun\\.com',
	'bulbagarden\\.net',
	'serebii\\.net',
	'nuggetbridge\\.com',
	'pokecommunity\\.com',
	'pokemon-online\\.eu',
	'pokemonlab\\.com',
	'shoddybattle\\.com',
	'pokemonxy\\.com',
	'pokemon\\.com',
	'pokemon-gl\\.com',
	'pokecheck\\.org',
	'projectpokemon\\.org',
	'pokemondb\\.net',
	'pokemoncentral\\.it',
	'poketrade\\.us',
	'neverused\\.net',
	'pokestrat\\.com',
	'pokestrat\\.io',
	'spo\\.ink',
	'jooas\\.com',
	'pokemongodb\\.net',
	'pokeassistant\\.com',
	'pokemon-sunmoon\\.com',
	'gamepress\\.gg',
	'trainertower\\.com',
	'pokepast\\.es',
	'pokepedia\\.fr',
	'randbatscalc\\.github\\.io',
	'ruins-of-alph\\.github\\.io',

	// personal sites
	'breakdown\\.forumotion\\.com',
	'pokemonmillennium\\.net',
	'thebattletower\\.no-ip\\.org',
	'meltsner\\.com',
	'guangcongluo\\.com',
	'cathyjf\\.com',
	'xiaotai\\.org',
	'xfix\\.pw',
	'pkmn\\.cc',
	'bumba\\.me',
	'strategydatabase\\.jimdo\\.com',
	'hidden50\\.github\\.io',
	'krisxv\\.github\\.io',
	// personal hosting sites
	'forumieren\\.com',
	'soforums\\.com',
	'proboards\\.com',
	'weebly\\.com',
	'freeforums\\.org',
	'forumactif\\.com',
	'forumotion\\.com',
	'bigbangpokemon\\.com',

	// rich text
	'docs\\.google\\.com',

	// text
	'pastebin\\.com',
	'hastebin\\.com',
	'pastie\\.io',
	'trello\\.com',
	'challonge\\.com',
	'piratepad\\.net',
	'pastebin\\.run',

	// music
	'plug\\.dj',
	'openings\\.moe',

	// images
	'prntscr\\.com',
	'prnt\\.sc',
	'puu\\.sh',
	'd\\.pr',
	'snag\\.gy',
	'gyazo\\.com',
	'imgur\\.com',
	'gfycat\\.com',
	'4cdn\\.org'
];

Config.roomsFirstOpenScript = function (mainMenuOnly) {
	/* eslint-disable */
	if (mainMenuOnly) {
		$('.leftmenu .activitymenu').first().after('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6535472412829264" data-ad-slot="7790916938" data-ad-format="auto"></ins>');
		try {
			(adsbygoogle = window.adsbygoogle || []).push({});
		} catch (e) {}
	} else if ($(window).width() >= 800 && location.protocol !== 'https:') {
		$('.roomlisttop').first().after('<ins class="adsbygoogle" style="display:inline-block;width:336px;height:280px" data-ad-client="ca-pub-6535472412829264" data-ad-slot="9267650135"></ins>');
		$('.roomlist').first().after('<ins class="adsbygoogle" style="display:inline-block;width:336px;height:280px" data-ad-client="ca-pub-6535472412829264" data-ad-slot="3029313334"></ins>');
		try {
			(adsbygoogle = window.adsbygoogle || []).push({});
			(adsbygoogle = window.adsbygoogle || []).push({});
		} catch (e) {}
	} else {
		$('.roomlisttop').first().after('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6535472412829264" data-ad-slot="7790916938" data-ad-format="auto"></ins>');
		$('.roomlist').first().after('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6535472412829264" data-ad-slot="1749652533" data-ad-format="auto"></ins>');
		try {
			(adsbygoogle = window.adsbygoogle || []).push({});
			(adsbygoogle = window.adsbygoogle || []).push({});
		} catch (e) {}
	}
	/* eslint-enable */
};

Config.customcolors = {
	'theimmortal': 'taco',
	'bmelts': 'testmelts',
	'zarel': 'aeo',
	'jumpluff': 'zacchaeus',
	'zacchaeus': 'jumpluff',
	'kraw': 'kraw1',
	'growlithe': 'steamroll',
	'snowflakes': 'endedinariot',
	'doomvendingmachine': 'theimmortal',
	'mikel': 'mikkel',
	'arcticblast': 'rsem',
	'mjb': 'thefourthchaser',
	'thefourthchaser': 'mjb',
	'tfc': 'mjb',
	'mikedecishere': 'mikedec3boobs',
	'heartsonfire': 'haatsuonfaiyaa',
	'royalty': 'wonder9',
	'limi': 'azure2',
	'ginganinja': 'piratesandninjas',
	'aurora': 'c6n6fek',
	'jdarden': 'danielcross',
	'solace': 'amorlan',
	'dcae': 'galvatron',
	'queenofrandoms': 'hahaqor',
	'jelandee': 'thejelandee',
	'diatom': 'dledledlewhooop',
	'texascloverleaf': 'aggronsmash',
	'treecko': 'treecko56',
	'violatic': 'violatic92',
	'exeggutor': 'ironmanatee',
	'ironmanatee': 'exeggutor',
	'skylight': 'aerithass',
	'nekonay': 'catbot20',
	'coronis': 'kowonis',
	'vaxter': 'anvaxter',
	'mattl': 'mattl34',
	'shaymin': 'test33',
	'kayo': 'endedinariot',
	'tgmd': 'greatmightydoom',
	'vacate': 'vacatetest',
	'bean': 'dragonbean',
	'yunan': 'osiris13',
	'politoed': 'brosb4hoohs',
	'scotteh': 'nsyncluvr67',
	'bumbadadabum': 'styrofoamboots',
	'yuihirasawa': 'weeabookiller',
	'monohearted': 'nighthearted',
	'prem': 'erinanakiri', // second color change
	'clefairy': 'fuckes',
	'morfent': 'aaaa',
	'crobat': 'supergaycrobat4',
	'beowulf': '298789z7z',
	'flippy': 'flippo',
	'raoulsteve247': 'raoulbuildingpc',
	'thedeceiver': 'colourtest011',
	'darnell': 'ggggggg',
	'shamethat': 'qpwkfklkjpskllj', // second color change
	'aipom': 'wdsddsdadas',
	'alter': 'spakling',
	'biggie': 'aoedoedad',
	'osiris': 'osiris12', // second color change
	'azumarill': 'azumarill69',
	'redew': 'redeww',
	'sapphire': 'masquerains',
	'calyxium': 'calyxium142',
	'kiracookie': 'kracookie',
	'blitzamirin': 'hikaruhitachii',
	'skitty': 'shckieei',
	'sweep': 'jgjjfgdfg', // second color change
	'panpawn': 'crowt',
	'val': 'pleasegivemecolorr',
	'valentine': 'pleasegivemecolorr',
	'briayan': 'haxorusxi',
	'xzern': 'mintycolors',
	'shgeldz': 'cactusl00ver',
	'abra': 'lunchawaits',
	'maomiraen': 'aaaaaa',
	'trickster': 'sunako',
	'articuno': 'bluekitteh177',
	'barton': 'hollywood15',
	'zodiax': '5olanto4',
	'ninetynine': 'blackkkk',
	'kasumi': 'scooter4000',
	'xylen': 'bloodyrevengebr',
	'aelita': 'y34co3',
	'fx': 'cm48ubpq',
	'horyzhnz': 'superguy69',
	'quarkz': 'quarkz345',
	'fleurdyleurse': 'calvaryfishes',
	'trinitrotoluene': '4qpr7pc5mb',
	'yuno': 'qgadlu6g',
	'austin': 'jkjkjkjkjkgdl',
	'jinofthegale': 'cainvelasquez',
	'waterbomb': 'naninan',
	'starbloom': 'taigaaisaka',
	'macle': 'flogged',
	'ashiemore': 'poncp',
	'charles': 'charlescarmichael',
	'sigilyph': 'diving', // second color change
	'spy': 'spydreigon',
	'kinguu': 'dodmen',
	'dodmen': 'kinguu',
	'magnemite': 'dsfsdffs',
	'ace': 'sigilyph143',
	'leftiez': 'xxxxnbbhiojll',
	'grim': 'grimoiregod',
	'strength': '0v0tqpnu',
	'honchkrow': 'nsyncluvr67',
	'quote': '64z7i',
	'snow': 'q21yzqgh',
	'omegaxis': 'omegaxis14',
	'paradise': 'rnxvzwpwtz',
	'sailorcosmos': 'goldmedalpas',
	'dontlose': 'dhcli22h',
	'tatsumaki': 'developmentary',
	'starry': 'starryblanket',
	'imas': 'imas234',
	'vexeniv': 'vexenx',
	'ayanosredscarf': 'ezichqog',
	'penquin': 'privatepenquin',
	'mraldo': 'mraldopls',
	'sawsbuck': 'deerling',
	'litten': 'samurott',
	'samurott': 'litten',
	'lunala': 'lunalavioleif',
	'wishes': 'unfixable',
	'nerd': 'eee4444444',
	'blaziken': 'knmfksdnf',
	'andy': 'agkoemv',
	'kris': 'qweqwwweedzvvpioop', // second color change
	'nv': 'larvitar',
	'iyarito': '8f40n',
	'paris': 'goojna',
	'moo': 'soccerzxii',
	'lyren': 'solarisfaux',
	'tiksi': 'tikse',
	'ev': 'eeveegeneral',
	'chespin': 'd4ukzezn',
	'halite': 'rosasite',
	'false': 'o5t9w5jl',
	'wally': 'wallythebully',
	'ant': 'nui',
	'nui': 'ant',
	'anubis': 'l99jh',
	'ceteris': 'eprtiuly',
	'om': 'omroom',
	'roman': 'wt2sd0qh',
	'maroon': 'rucbwbeg',
	'lyd': 'ahdjfidnf',
	'perry': 'mrperry',
	'yogibears': 'bwahahahahahahahaha',
	'tjay': 'teej19',
	'explodingdaisies': '85kgt',
	'flare': 'nsyncluvr67',
	'tenshi': 'tenshinagae',
	'pre': '0km',
	'ransei': '54j7o',
	'snaquaza': 'prrrrrrrrr',
	'alpha': 'alphawittem',
	'asheviere': '54hw4',
	'taranteeeno': 'moondazingo',
	'rage': 'hipfiregod',
	'andrew': 'stevensnype',
	'robyn': 'jediruwu',
	'birdy': 'cmstrall',
	'pirateprincess': '45mbh',
	'tempering': 'tempho',
	'chazm': 'chazmicsupanova',
	'arsenal': '558ru',
	'celestial': 'cvpux4zn',
	'luigi': 'luifi',
	'mitsuki': 'latiosred',
	'faku': 'ifaku',
	'pablo': 'arrested',
	'facu': 'facundoooooooo',
	'gimmick': 'gimm1ck',
	'pichus': 'up1gat8f',
	'pigeons': 'pigeonsvgc',
	'clefable': '147x0', // +HiMyNamesL, former gstaff - apparently cleared with Zarel via Discord PM
	'splash': 'mitsukokongou',
	'talah': '2b',
	'cathy': '' //{color: '#ff5cb6'}
};

// `defaultserver` specifies the server to use when the domain name in the
// address bar is `Config.routes.client`.
Config.defaultserver = {
	id: 'showdown',
	host: 'sim3.psim.us',
	port: 443,
	httpport: 8000,
	altport: 80,
	registered: true
};

/*** Begin automatically generated configuration ***/
Config.version = "0.11.2 (f5d8b0cc)";

Config.routes = {
	root: 'pokemonshowdown.com',
	client: 'play.pokemonshowdown.com',
	dex: 'dex.pokemonshowdown.com',
	replays: 'replay.pokemonshowdown.com',
	users: 'pokemonshowdown.com/users',
};
/*** End automatically generated configuration ***/


exports.Config = Config;