"""MCP köprüsü testleri: protokol + sahte Unreal Remote Control sunucusu."""
import json
import os
import subprocess
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER = os.path.join(HERE, "..", "mcp", "rize_unreal_mcp.py")


class FakeUnreal(BaseHTTPRequestHandler):
    calls = []

    def do_PUT(self):  # noqa: N802
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        FakeUnreal.calls.append((self.path, body))
        code = body["parameters"]["PythonCommand"]
        ok = "raise" not in code
        resp = {"ReturnValue": ok, "CommandResult": "" if ok else "Traceback: boom",
                "LogOutput": [{"Type": "Info", "Output": "çalıştı: " + code.strip().splitlines()[-1][:60]}]}
        data = json.dumps(resp).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass


class TestMcpBridge(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.http = HTTPServer(("127.0.0.1", 0), FakeUnreal)
        threading.Thread(target=cls.http.serve_forever, daemon=True).start()
        env = dict(os.environ, RIZE_UE_URL=f"http://127.0.0.1:{cls.http.server_port}", NO_PROXY="127.0.0.1,localhost", no_proxy="127.0.0.1,localhost")
        cls.proc = subprocess.Popen([sys.executable, SERVER], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, env=env)
        cls.next_id = 0

    @classmethod
    def tearDownClass(cls):
        cls.proc.stdin.close()
        cls.proc.wait(timeout=5)
        cls.proc.stdout.close()
        cls.http.shutdown()
        cls.http.server_close()

    def rpc(self, method, params=None, notify=False):
        msg = {"jsonrpc": "2.0", "method": method}
        if params is not None:
            msg["params"] = params
        if not notify:
            TestMcpBridge.next_id += 1
            msg["id"] = TestMcpBridge.next_id
        self.proc.stdin.write(json.dumps(msg) + "\n")
        self.proc.stdin.flush()
        if notify:
            return None
        return json.loads(self.proc.stdout.readline())

    def test_1_initialize(self):
        r = self.rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "1"}})
        self.assertEqual(r["result"]["protocolVersion"], "2025-06-18")
        self.assertIn("tools", r["result"]["capabilities"])
        self.rpc("notifications/initialized", notify=True)  # yanıt beklenmez

    def test_2_tools_list(self):
        tools = {t["name"]: t for t in self.rpc("tools/list")["result"]["tools"]}
        for name in ("ue_ping", "ue_run_python", "ue_console", "rize_import_layout", "rize_set_weather", "rize_validate_data"):
            self.assertIn(name, tools)
            self.assertEqual(tools[name]["inputSchema"]["type"], "object")

    def test_3_run_python_roundtrip(self):
        r = self.rpc("tools/call", {"name": "ue_run_python", "arguments": {"code": "print('merhaba Rize')"}})
        self.assertFalse(r["result"]["isError"])
        self.assertIn("merhaba Rize", r["result"]["content"][0]["text"])
        path, body = FakeUnreal.calls[-1]
        self.assertEqual(path, "/remote/object/call")
        self.assertEqual(body["objectPath"], "/Script/PythonScriptPlugin.Default__PythonScriptLibrary")
        self.assertEqual(body["functionName"], "ExecutePythonCommandEx")

    def test_4_python_error_is_tool_error(self):
        r = self.rpc("tools/call", {"name": "ue_run_python", "arguments": {"code": "raise ValueError()"}})
        self.assertTrue(r["result"]["isError"])

    def test_5_weather_goes_to_pie_console(self):
        r = self.rpc("tools/call", {"name": "rize_set_weather", "arguments": {"weather": "Saganak"}})
        self.assertFalse(r["result"]["isError"])
        code = FakeUnreal.calls[-1][1]["parameters"]["PythonCommand"]
        self.assertIn("get_game_world", code)
        self.assertIn("RizeHava Saganak", code)

    def test_6_validate_data_offline(self):
        r = self.rpc("tools/call", {"name": "rize_validate_data", "arguments": {}})
        self.assertEqual(r["result"]["content"][0]["text"], "Veri dosyaları tutarlı.")

    def test_7_unknown(self):
        self.assertEqual(self.rpc("tools/call", {"name": "yok"})["error"]["code"], -32602)
        self.assertEqual(self.rpc("bilinmeyen/yontem")["error"]["code"], -32601)


if __name__ == "__main__":
    unittest.main()
