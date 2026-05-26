import { Command } from "commander";
import { loadConfig, parseMode } from "./config.js";
import { ensureEnvFile, formatKeySetupGuide } from "./keySetup.js";
import { discoverModels } from "./modelDiscovery.js";
import { rankModels } from "./modelRanker.js";
import { formatDecision, routeTask } from "./router.js";
import { runSecurityCheck } from "./securityCheck.js";
import { classifyTask } from "./taskClassifier.js";
import { compressContextFile } from "./utils/contextCompressor.js";
import { logger } from "./utils/logger.js";

export function createCli(): Command {
  const program = new Command();
  program
    .name("best-ai-finder-router")
    .description("Discover, rank, and route tasks to the best currently available AI.")
    .option("-m, --mode <mode>", "Routing mode: best, balanced, budget, private");

  program
    .command("discover")
    .description("Discover currently available models from configured providers.")
    .action(async () => {
      const config = loadConfig();
      const result = await discoverModels(config);
      logger.info(`Discovery source: ${result.usedLiveDiscovery ? "live" : "cache"}`);
      logger.info(`Models discovered: ${result.models.length}`);
      for (const model of result.models) {
        logger.info(`- ${model.displayName} [${model.provider}] quality=${model.qualityTier} cost=${model.costTier} context=${model.contextWindow ?? "unknown"}`);
      }
      if (result.notices.length > 0) {
        logger.info("\nNotices:");
        result.notices.forEach((notice) => logger.info(`- ${notice}`));
      }
    });

  program
    .command("rank")
    .description("Rank models for a task without sending the task to a provider.")
    .argument("<task>", "Task to rank models against")
    .option("-m, --mode <mode>", "Routing mode")
    .action(async (taskText: string, options: { mode?: string }) => {
      const config = loadConfig();
      const mode = parseMode(options.mode ?? program.opts<{ mode?: string }>().mode, config);
      const task = classifyTask(taskText);
      const discovery = await discoverModels(config);
      const ranked = rankModels(discovery.models, task, mode);
      logger.info(`Task type: ${task.type}`);
      logger.info(`Mode: ${mode}`);
      logger.info(`Discovery: ${discovery.usedLiveDiscovery ? "live discovery" : "cache fallback"}`);
      ranked.slice(0, 8).forEach((entry, index) => {
        logger.info(`${index + 1}. ${entry.model.displayName} [${entry.model.provider}] score=${entry.score}`);
        logger.info(`   reasons: ${(entry.reasons.length ? entry.reasons : ["Weighted fit"]).join("; ")}`);
      });
    });

  program
    .command("route")
    .description("Select the best model for a task and explain the decision.")
    .argument("<task>", "Task to route")
    .option("-m, --mode <mode>", "Routing mode")
    .action(async (taskText: string, options: { mode?: string }) => {
      const config = loadConfig();
      const mode = parseMode(options.mode ?? program.opts<{ mode?: string }>().mode, config);
      const decision = await routeTask(taskText, mode, config);
      logger.info(formatDecision(decision));
    });

  program
    .command("compress-context")
    .description("Compress a JSON project context into a clean handoff.")
    .argument("<file>", "JSON context file")
    .action(async (file: string) => {
      logger.info(await compressContextFile(file));
    });

  program
    .command("security-check")
    .description("Scan the repo for common leaked secrets and unsafe local model URLs.")
    .action(async () => {
      const result = await runSecurityCheck();
      if (result.findings.length > 0) {
        logger.error("Security check failed:");
        result.findings.forEach((finding) => logger.error(`${finding.file}: ${finding.issue}. ${finding.detail}`));
        process.exitCode = 1;
        return;
      }
      logger.info("Security check passed: no obvious secrets or unsafe local model URLs found.");
    });

  program
    .command("setup-keys")
    .description("Show official API key pages and create a local .env file when needed.")
    .option("--create-env", "Create .env from .env.example if it does not exist")
    .action(async (options: { createEnv?: boolean }) => {
      if (options.createEnv) {
        const status = await ensureEnvFile();
        logger.info(status === "created" ? "Created .env from .env.example." : ".env already exists; leaving it unchanged.");
        logger.info("");
      }
      logger.info(formatKeySetupGuide());
    });

  return program;
}
