ERROR:    Traceback (most recent call last):
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 145, in __init__
    self._dbapi_connection = engine.raw_connection()
                             ^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 3297, in raw_connection
    return self.pool.connect()
           ^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 449, in connect
    return _ConnectionFairy._checkout(self)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 1264, in _checkout
    fairy = _ConnectionRecord.checkout(pool)
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 713, in checkout
    rec = pool._do_get()
          ^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\impl.py", line 179, in _do_get
    with util.safe_reraise():
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 224, in __exit__
    raise exc_value.with_traceback(exc_tb)
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\impl.py", line 177, in _do_get
    return self._create_connection()
           ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 390, in _create_connection
    return _ConnectionRecord(self)
           ^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 675, in __init__
    self.__connect()
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 901, in __connect
    with util.safe_reraise():
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 224, in __exit__
    raise exc_value.with_traceback(exc_tb)
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 897, in __connect
    self.dbapi_connection = connection = pool._invoke_creator(self)
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\create.py", line 646, in connect
    return dialect.connect(*cargs, **cparams)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 625, in connect
    return self.loaded_dbapi.connect(*cargs, **cparams)  # type: ignore[no-any-return]  # NOQA: E501
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\psycopg2\__init__.py", line 
122, in connect
    conn = _connect(dsn, connection_factory=connection_factory, **kwasync)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
psycopg2.OperationalError: could not translate host name "dpg-d1aqti0dl3ps73e08upg-a" to address: Host desconocido.


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\starlette\routing.py", line 
692, in lifespan
    async with self.lifespan_context(app) as maybe_state:
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\starlette\routing.py", line 
569, in __aenter__
    await self._router.startup()
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\starlette\routing.py", line 
671, in startup
    handler()
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\endpointsdb.py", line 74, in startup_event
    Base.metadata.create_all(bind=engine)
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\sql\schema.py", line 5924, in create_all
    bind._run_ddl_visitor(
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 3247, in _run_ddl_visitor
    with self.begin() as conn:
  File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.11_3.11.2544.0_x64__qbz5n2kfra8p0\Lib\contextlib.py", line 137, in __enter__
    return next(self.gen)
           ^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 3237, in begin
    with self.connect() as conn:
         ^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 3273, in connect
    return self._connection_cls(self)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 147, in __init__
    Connection._handle_dbapi_exception_noconnection(
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 2436, in _handle_dbapi_exception_noconnection
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 145, in __init__
    self._dbapi_connection = engine.raw_connection()
                             ^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", 
line 3297, in raw_connection
    return self.pool.connect()
           ^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 449, in connect
    return _ConnectionFairy._checkout(self)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 1264, in _checkout
    fairy = _ConnectionRecord.checkout(pool)
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 713, in checkout
    rec = pool._do_get()
          ^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\impl.py", line 179, in _do_get
    with util.safe_reraise():
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 224, in __exit__
    raise exc_value.with_traceback(exc_tb)
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\impl.py", line 177, in _do_get
    return self._create_connection()
           ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 390, in _create_connection
    return _ConnectionRecord(self)
           ^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 675, in __init__
    self.__connect()
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 901, in __connect
    with util.safe_reraise():
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 224, in __exit__
    raise exc_value.with_traceback(exc_tb)
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\pool\base.py", line 897, in __connect
    self.dbapi_connection = connection = pool._invoke_creator(self)
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\create.py", line 646, in connect
    return dialect.connect(*cargs, **cparams)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 625, in connect
    return self.loaded_dbapi.connect(*cargs, **cparams)  # type: ignore[no-any-return]  # NOQA: E501
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Facultad\Facultad 2025\Comunicacion de Datos\TP integrado\TP-Comunicacion\backend\venv\Lib\site-packages\psycopg2\__init__.py", line 
122, in connect
    conn = _connect(dsn, connection_factory=connection_factory, **kwasync)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not translate host name "dpg-d1aqti0dl3ps73e08upg-a" to address: Host desconocido.

(Background on this error at: https://sqlalche.me/e/20/e3q8)

ERROR:    Application startup failed. Exiting.
