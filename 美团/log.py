# -*- coding: utf-8 -*-
import logging
import platform

__all__ = ['logger']

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

formatter = logging.Formatter(f'{platform.node()} %(asctime)s [%(levelname).1s] [%(filename)s %(funcName)s %(lineno)d] | %(message)s')
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# file_handler = RotatingFileHandler(CONFIG.BASE_DIR.joinpath('logs/info.log'), maxBytes=1024 * 1024 * 100, backupCount=1, encoding='utf-8')
# file_handler.setLevel(logging.INFO)
# file_handler.setFormatter(formatter)
# logger.addHandler(file_handler)
#
# error_handler = RotatingFileHandler(CONFIG.BASE_DIR.joinpath('logs/error.log'), maxBytes=1024 * 1024 * 100, backupCount=1, encoding='utf-8')
# error_handler.setLevel(logging.ERROR)
# error_handler.setFormatter(formatter)
# error_handler.addFilter(lambda record: record.levelno >= logging.ERROR)
# logger.addHandler(error_handler)
