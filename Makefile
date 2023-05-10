# this makefile was implemented to run a few of commands that will work against the whole repo


release:
	yarn lerna version --force-publish

help:
	@echo "--------------------------------------------------------------"
	@echo "\033[1m\t\tTF-MakeFile Commands Reference\033[0m"
	@echo "--------------------------------------------------------------"
	@echo "Available targets:"

# Help Command
	@echo "\t+\033[32m help\033[0m -> \033[1mPrint this help message.\033[0m"
# Build Command
	@echo "\t+\033[32m build\033[0m -> \033[1mBuild all projects/packages.\033[0m"
# **args
# Stats
	@echo "\t\t+\033[32m project=stats\033[0m -> \033[1mBuild the stats project.\033[0m"
# Weblets
	@echo "\t\t+\033[32m project=weblets\033[0m -> \033[1mBuild the weblets project.\033[0m"
# Dashboard
	@echo "\t\t+\033[32m project=dashboard\033[0m -> \033[1mBuild the dashboard project.\033[0m"
# Grid Client
	@echo "\t\t+\033[32m project=grid_client\033[0m -> \033[1mBuild the grid_client project.\033[0m"
# TFChain Client
	@echo "\t\t+\033[32m project=tfchain_client\033[0m -> \033[1mBuild the tfchain_client project.\033[0m"
# Grid Rmb Server
	@echo "\t\t+\033[32m project=grid_rmb_server\033[0m -> \033[1mBuild the grid_rmb_server project.\033[0m"
# Rmb Peer Client
	@echo "\t\t+\033[32m project=rmb_peer_client\033[0m -> \033[1mBuild the rmb_peer_client project.\033[0m"
# Rmb Peer Server
	@echo "\t\t+\033[32m project=rmb_peer_server\033[0m -> \033[1mBuild the rmb_peer_server project.\033[0m"
# Grid Http Server
	@echo "\t\t+\033[32m project=grid_http_server\033[0m -> \033[1mBuild the grid_http_server project.\033[0m"
# Rmb Direct Client
	@echo "\t\t+\033[32m project=rmb_direct_client\033[0m -> \033[1mBuild the rmb_direct_client project.\033[0m"
# Release Command
	@echo "\t+\033[32m release\033[0m -> \033[1mUpdate the package version if it's used as a dependency in the other packages in the monorepo except the playground package.\033[0m"
# Examples
	@echo "\n\033[32m Example: how to use the build command with an exact project\033[0m : \033[1mmake build project=<project_name>.\033[0m\n"

build:
ifeq ($(project), dashboard)
	cd packages/dashboard && yarn build
else ifeq ($(project), grid_client)
	cd packages/grid_client && yarn build
else ifeq ($(project), grid_http_server)
	cd packages/grid_http_server && yarn build
else ifeq ($(project), grid_rmb_server)
	cd packages/grid_rmb_server && yarn build
else ifeq ($(project), rmb_direct_client)
	cd packages/rmb_direct_client && yarn build
else ifeq ($(project), rmb_peer_client)
	cd packages/rmb_peer_client && yarn build
else ifeq ($(project), rmb_peer_server)
	cd packages/rmb_peer_server && yarn build
else ifeq ($(project), stats)
	cd packages/stats && yarn build
else ifeq ($(project), tfchain_client)
	cd packages/tfchain_client && yarn build
else ifeq ($(project), weblets)
	cd packages/weblets/playground && yarn build
else
	yarn lerna run build --no-private
endif