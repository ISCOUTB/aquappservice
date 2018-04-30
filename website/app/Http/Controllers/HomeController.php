<?php
namespace AquApp\Http\Controllers;

class HomeController extends Controller {
  public function index() {
    $client = new \GuzzleHttp\Client();
    $res = $client->request('GET', 'http://api/api/v1/nodes');
    $msg = "<h1>Nodes</h1><ul>";
    $json = json_decode($res->getBody()->getContents(), true);
    foreach ($json as $node) {
      $msg .= "<li> ID: " . $node["_id"] . " Name: " . $node["name"] . "</li>";
    }
    return $msg . "</ul>";
  }
}
