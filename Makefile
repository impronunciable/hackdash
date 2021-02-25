deploy:
	docker-compose up -d --build

shutdown:
	docker-compose down

ps:
	docker-compose ps

logs:
	docker-compose logs ${svc}

exec:
	docker-compose exec web ${cmd}