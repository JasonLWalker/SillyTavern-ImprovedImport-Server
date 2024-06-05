import bodyParser from 'body-parser';
import express, { Router } from 'express';
import { initNovelAiRoutes } from './novelai';
import { PluginInfo, pluginInfo, initUtilityRoutes } from './util';

export interface Plugin {
    init: (router: Router) => Promise<void>;
    exit: () => Promise<void>;
    info: PluginInfo;
}


/**
 * Initialize the plugin.
 * @param router Express Router
 */
export async function init(router: Router): Promise<void> {
    // Initialize each set of routes separately for future growth
    initUtilityRoutes(router);
    initNovelAiRoutes(router);

}

export async function exit(): Promise<void> {
//    console.log(chalk.yellow(MODULE_NAME), 'Plugin exited');
}

const plugin: Plugin = {
    init,
    exit,
    info: pluginInfo,
};

export default plugin;
